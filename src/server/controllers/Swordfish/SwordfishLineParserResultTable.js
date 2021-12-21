import _ from 'lodash';
import logger from '../../lib/logger';

const log = logger('controller:Swordfish');

class SwordfishLineParserResultTable {
    // {"table": { "name": "tool", "records": [ ... ]}}
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

        const table = _.get(line, 'table');

        if (!table) {
            return null;
        }

        return {
            type: SwordfishLineParserResultTable,
            payload: table
        };
    }
}

export default SwordfishLineParserResultTable;
