import _ from 'lodash';
import logger from '../../lib/logger';

const log = logger('controller:Swordfish');

class SwordfishLineParserResultAction {
    // echo:
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

        const action = _.get(line, 'action');

        if (!action) {
            return null;
        }

        return {
            type: SwordfishLineParserResultAction,
            payload: action
        };
    }
}

export default SwordfishLineParserResultAction;
