import { noop } from 'lodash';

class SwordfishLineParserResultError {
    // Error:Printer halted. kill() called!
    static parse(line) {
        const r = line.match(/^error(#(\d+))?(:(.*))?$/i);
        if (!r) {
            return null;
        }

        let result = {};

        try {
            result = JSON.parse(r[4]);
        } catch {
            noop();
        }

        const payload = {
            id: r[2],
            result: result
        };

        return {
            type: SwordfishLineParserResultError,
            payload: payload
        };
    }
}

export default SwordfishLineParserResultError;
