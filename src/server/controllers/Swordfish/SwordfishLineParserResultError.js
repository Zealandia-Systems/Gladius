class SwordfishLineParserResultError {
    // Error:Printer halted. kill() called!
    static parse(line) {
        const r = line.match(/^Error:\s*(.+)$/i);
        if (!r) {
            return null;
        }

        const payload = {
            message: r[1]
        };

        return {
            type: SwordfishLineParserResultError,
            payload: payload
        };
    }
}

export default SwordfishLineParserResultError;
