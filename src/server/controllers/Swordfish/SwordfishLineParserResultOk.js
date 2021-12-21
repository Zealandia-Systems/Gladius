import { noop } from 'lodash';

class SwordfishLineParserResultOk {
    // ok
    static parse(line) {
        const r = line.match(/^ok(#(\d+))?(:(.*))?$/i);
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
            result
        };

        return {
            type: SwordfishLineParserResultOk,
            payload: payload
        };
    }
}

export default SwordfishLineParserResultOk;
