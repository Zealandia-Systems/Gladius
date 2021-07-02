class SwordfishLineParserResultOk {
    // ok
    static parse(line) {
        const r = line.match(/^ok$/);
        if (!r) {
            return null;
        }

        const payload = {};

        return {
            type: SwordfishLineParserResultOk,
            payload: payload
        };
    }
}

export default SwordfishLineParserResultOk;
