class SwordfishLineParserResultStart {
    // start
    static parse(line) {
        const r = line.match(/^start$/);
        if (!r) {
            return null;
        }

        const payload = {};

        return {
            type: SwordfishLineParserResultStart,
            payload: payload
        };
    }
}

export default SwordfishLineParserResultStart;
