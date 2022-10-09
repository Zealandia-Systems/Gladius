/* eslint max-classes-per-file: 0 */
import events from 'events';
import evaluateExpression from './evaluate-expression';

export const SP_TYPE_SEND_RESPONSE = 0;
export const SP_TYPE_CHAR_COUNTING = 1;

const noop = () => {};

class SPSendResponse {
    callback = null;

    constructor(options, callback = noop) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        if (typeof callback === 'function') {
            this.callback = callback;
        }
    }

    process() {
        this.callback && this.callback(this);
    }

    clear() {
        // Do nothing
    }

    get type() {
        return SP_TYPE_SEND_RESPONSE;
    }
}

class SPCharCounting {
    callback = null;

    state = {
        bufferSize: 128, // Defaults to 128
        dataLength: 0,
        queue: [],
        line: ''
    };

    constructor(options, callback = noop) {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }

        // bufferSize
        const bufferSize = Number(options.bufferSize);
        if (bufferSize && bufferSize > 0) {
            this.state.bufferSize = bufferSize;
        }

        if (typeof callback === 'function') {
            this.callback = callback;
        }
    }

    process() {
        this.callback && this.callback(this);
    }

    reset() {
        this.state.bufferSize = 128; // Defaults to 128
        this.state.dataLength = 0;
        this.state.queue = [];
        this.state.line = '';
    }

    clear() {
        this.state.dataLength = 0;
        this.state.queue = [];
        this.state.line = '';
    }

    get type() {
        return SP_TYPE_CHAR_COUNTING;
    }

    get bufferSize() {
        return this.state.bufferSize;
    }

    set bufferSize(bufferSize = 0) {
        bufferSize = Number(bufferSize);
        if (!bufferSize) {
            return;
        }

        // The buffer size cannot be reduced below the size of the data within the buffer.
        this.state.bufferSize = Math.max(bufferSize, this.state.dataLength);
    }

    get dataLength() {
        return this.state.dataLength;
    }

    set dataLength(dataLength) {
        this.state.dataLength = dataLength;
    }

    get queue() {
        return this.state.queue;
    }

    set queue(queue) {
        this.state.queue = queue;
    }

    get line() {
        return this.state.line;
    }

    set line(line) {
        this.state.line = line;
    }
}

class Sender extends events.EventEmitter {
    // streaming protocol
    sp = null;

    state = {
        hold: false,
        holdReason: null,
        statusMessage: null,
        name: '',
        gcode: '',
        context: {},
        lines: [],
        stack: [],
        total: 0,
        sent: 0,
        received: 0,
        startTime: 0,
        finishTime: 0,
        elapsedTime: 0,
        remainingTime: 0
    };

    stateChanged = false;

    dataFilter = null;

    // @param {number} [type] Streaming protocol type. 0 for send-response, 1 for character-counting.
    // @param {object} [options] The options object.
    // @param {number} [options.bufferSize] The buffer size used in character-counting streaming protocol. Defaults to 127.
    // @param {function} [options.dataFilter] A function to be used to handle the data. The function accepts two arguments: The data to be sent to the controller, and the context.
    constructor(type = SP_TYPE_SEND_RESPONSE, options = {}) {
        super();

        if (typeof options.dataFilter === 'function') {
            this.dataFilter = options.dataFilter;
        }

        // character-counting
        if (type === SP_TYPE_CHAR_COUNTING) {
            this.sp = new SPCharCounting(options, (sp) => {
                if (sp.queue.length > 0) {
                    const lineLength = sp.queue.shift();
                    sp.dataLength -= lineLength;
                }

                while (!this.state.hold && (this.state.sent < this.state.total)) {
                    // Remove leading and trailing whitespace from both ends of a string
                    sp.line = sp.line || this.state.lines[this.state.sent].trim();

                    if (this.dataFilter) {
                        sp.line = this.dataFilter(sp.line, this.state.context) || '';
                    }

                    // The newline character (\n) consumed the RX buffer space
                    if ((sp.line.length > 0) && ((sp.dataLength + sp.line.length + 1) >= sp.bufferSize)) {
                        break;
                    }

                    this.state.sent++;
                    this.emit('change');

                    if (sp.line.length === 0) {
                        this.ack(); // ack empty line
                        continue;
                    }

                    const line = sp.line + '\n';
                    sp.line = '';
                    sp.dataLength += line.length;
                    sp.queue.push(line.length);
                    this.emit('data', line, this.state.context);
                }
            });
        }

        // send-response
        if (type === SP_TYPE_SEND_RESPONSE) {
            this.sp = new SPSendResponse(options, (sp) => {
                while (!this.state.hold && (this.state.sent < this.state.total)) {
                    // Remove leading and trailing whitespace from both ends of a string
                    let line = this.state.lines[this.state.sent].trim();

                    if (line.startsWith('%while ')) {
                        const value = evaluateExpression(line.slice(7), this.state.context);

                        if (Boolean(value)) {
                            this.state.stack.push({ type: 'while', line: this.state.sent - 1 });
                            line = '';
                        } else {
                            // find the matching %end
                            let count = 1;

                            for (let i = this.state.sent + 1; i < this.state.lines.length; i++) {
                                let skipped = this.state.lines[i].trim();

                                if (skipped.startsWith('%while ')) {
                                    count++;
                                } else if (skipped.startsWith('%end')) {
                                    count--;

                                    if (count === 0) {
                                        this.state.received += i - this.state.sent;
                                        this.state.sent = i;

                                        line = '';
                                    }
                                }
                            }
                        }
                    } else if (line.startsWith('%end')) {
                        let frame = this.state.stack.pop();

                        switch (frame.type) {
                        case 'while': {
                            let i = this.state.sent;

                            this.state.sent = frame.line;
                            this.state.received -= i - frame.line;

                            line = '';

                            break;
                        }

                        default: {
                            noop();

                            break;
                        }
                        }
                    } else if (line.startsWith('%export ')) {
                        const data = evaluateExpression(line.slice(8), this.state.context);

                        if (Array.isArray(data)) {
                            let keys = [];

                            for (let i = 0; i < data.length; i++) {
                                const item = data[i];

                                // eslint-disable-next-line no-unused-vars
                                for (const [key, _] of Object.entries(item)) {
                                    if (!keys.includes(key)) {
                                        keys.push(key);
                                    }
                                }
                            }

                            this.emit('export', { keys, data });
                        }

                        line = '';
                    } else if (this.dataFilter) {
                        line = this.dataFilter(line, this.state.context) || '';
                    }

                    this.state.sent++;
                    this.emit('change');

                    if (line.length === 0) {
                        this.ack(); // ack empty line
                        continue;
                    }

                    this.emit('data', line + '\n', this.state.context);
                    break;
                }
            });
        }

        this.on('change', () => {
            this.stateChanged = true;
        });
    }

    toJSON() {
        return {
            sp: this.sp.type,
            hold: this.state.hold,
            holdReason: this.state.holdReason,
            statusMessage: this.state.statusMessage,
            name: this.state.name,
            context: this.state.context,
            size: this.state.gcode.length,
            total: this.state.total,
            sent: this.state.sent,
            received: this.state.received,
            startTime: this.state.startTime,
            finishTime: this.state.finishTime,
            elapsedTime: this.state.elapsedTime,
            remainingTime: this.state.remainingTime
        };
    }

    status(message) {
        this.state.statusMessage = message;
        this.emit('status');
        this.emit('change');
    }

    hold(reason) {
        if (this.state.hold) {
            return;
        }
        this.state.hold = true;
        this.state.holdReason = reason;
        this.emit('hold');
        this.emit('change');
    }

    unhold() {
        if (!this.state.hold) {
            return;
        }
        this.state.hold = false;
        this.state.holdReason = null;
        this.emit('unhold');
        this.emit('change');
    }

    // @return {boolean} Returns true on success, false otherwise.
    load(name, gcode = '', context = {}) {
        if (typeof gcode !== 'string' || !gcode) {
            return false;
        }

        const lines = gcode.split('\n');

        if (this.sp) {
            this.sp.clear();
        }
        this.state.hold = false;
        this.state.holdReason = null;
        this.state.statusMessage = null;
        this.state.name = name;
        this.state.gcode = gcode;
        this.state.context = context;
        this.state.lines = lines;
        this.state.total = this.state.lines.length;
        this.state.sent = 0;
        this.state.received = 0;
        this.state.startTime = 0;
        this.state.finishTime = 0;
        this.state.elapsedTime = 0;
        this.state.remainingTime = 0;

        this.emit('load', name, gcode, context);
        this.emit('change');

        return true;
    }

    unload() {
        if (this.sp) {
            this.sp.clear();
        }
        this.state.hold = false;
        this.state.holdReason = null;
        this.state.statusMessage = null;
        this.state.name = '';
        this.state.gcode = '';
        this.state.context = {};
        this.state.lines = [];
        this.state.total = 0;
        this.state.sent = 0;
        this.state.received = 0;
        this.state.startTime = 0;
        this.state.finishTime = 0;
        this.state.elapsedTime = 0;
        this.state.remainingTime = 0;

        this.emit('unload');
        this.emit('change');
    }

    // Tells the sender an acknowledgement has received.
    // @return {boolean} Returns true on success, false otherwise.
    ack() {
        if (!this.state.gcode) {
            return false;
        }

        if (this.state.received >= this.state.sent) {
            return false;
        }

        this.state.received++;
        this.emit('change');

        return true;
    }

    // Tells the sender to send more data.
    // @return {boolean} Returns true on success, false otherwise.
    next() {
        if (!this.state.gcode) {
            return false;
        }

        const now = new Date().getTime();

        if (this.state.total > 0 && this.state.sent === 0) {
            this.state.startTime = now;
            this.state.finishTime = 0;
            this.state.elapsedTime = 0;
            this.state.remainingTime = 0;
            this.emit('start', this.state.startTime);
            this.emit('change');
        }

        if (this.sp) {
            this.sp.process();
        }

        // Elapsed Time
        this.state.elapsedTime = now - this.state.startTime;

        // Make a 1 second delay before estimating the remaining time
        if (this.state.elapsedTime >= 1000 && this.state.received > 0) {
            const timePerCode = this.state.elapsedTime / this.state.received;
            this.state.remainingTime = (timePerCode * this.state.total - this.state.elapsedTime);
        }

        if (this.state.received >= this.state.total) {
            if (this.state.finishTime === 0) {
                // avoid issue 'end' multiple times
                this.state.finishTime = now;
                this.emit('end', this.state.finishTime);
                this.emit('change');
            }
        }

        return true;
    }

    // Rewinds the internal array pointer.
    // @return {boolean} Returns true on success, false otherwise.
    rewind() {
        if (!this.state.gcode) {
            return false;
        }

        if (this.sp) {
            this.sp.clear();
        }
        this.state.hold = false; // clear hold off state
        this.state.holdReason = null;
        this.state.statusMessage = null;
        this.state.sent = 0;
        this.state.received = 0;
        this.emit('change');

        return true;
    }

    // Checks if there are any state changes. It also clears the stateChanged flag.
    // @return {boolean} Returns true on state changes, false otherwise.
    peek() {
        const stateChanged = this.stateChanged;
        this.stateChanged = false;
        return stateChanged;
    }
}

export default Sender;
