import _ from 'lodash';
import SwordfishLineParserResultAction from './SwordfishLineParserResultAction';
import SwordfishLineParserResultEcho from './SwordfishLineParserResultEcho';
import SwordfishLineParserResultState from './SwordfishLineParserResultState';
import SwordfishLineParserResultError from './SwordfishLineParserResultError';
import SwordfishLineParserResultFirmware from './SwordfishLineParserResultFirmware';
import SwordfishLineParserResultOk from './SwordfishLineParserResultOk';
import SwordfishLineParserResultPosition from './SwordfishLineParserResultPosition';
import SwordfishLineParserResultStart from './SwordfishLineParserResultStart';

class SwordfishLineParser {
    parse(line) {
        const parsers = [
            SwordfishLineParserResultStart,
            SwordfishLineParserResultFirmware,
            SwordfishLineParserResultPosition,
            SwordfishLineParserResultState,
            SwordfishLineParserResultOk,
            SwordfishLineParserResultAction,
            SwordfishLineParserResultEcho,
            SwordfishLineParserResultError,
        ];

        for (let parser of parsers) {
            const result = parser.parse(line);
            if (result) {
                _.set(result, 'payload.raw', line);
                return result;
            }
        }

        return {
            type: null,
            payload: {
                raw: line
            }
        };
    }
}

export default SwordfishLineParser;
