class SwordfishLineParserResultEcho {
    // echo:
    static parse(line) {
        const r = line.match(/^echo:\s*(.+)$/i);
        if (!r) {
            return null;
        }

        const payload = {
            message: r[1]
        };

        return {
            type: SwordfishLineParserResultEcho,
            payload: payload
        };
    }
}

export default SwordfishLineParserResultEcho;
