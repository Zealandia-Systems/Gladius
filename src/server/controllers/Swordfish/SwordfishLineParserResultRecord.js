import _ from 'lodash';
import logger from '../../lib/logger';

const log = logger('controller:Swordfish');

class SwordfishLineParserResultRecord {
    // {"record": { "table": "tool", "index": 1, ... }}
    static parse(line) {
        if (!line.match(/^{/)) {
            return null;
        }

        try {
            line = JSON.parse(line);
        } catch (err) {
            log.silly(`json parse error: ${err}`);

            return null;
        }

        const record = _.get(line, 'record');

        if (!record) {
            return null;
        }

        return {
            type: SwordfishLineParserResultRecord,
            payload: record
        };
    }
}

export default SwordfishLineParserResultRecord;
