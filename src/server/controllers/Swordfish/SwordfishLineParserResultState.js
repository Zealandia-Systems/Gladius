import _ from 'lodash';
import logger from '../../lib/logger';

const log = logger('controller:Swordfish');

class SwordfishLineParserResultState {
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

        const state = _.get(line, 'state');

        if (!state) {
            return null;
        }

        return {
            type: SwordfishLineParserResultState,
            payload: {
                activeState: state
            }
        };
    }
}

export default SwordfishLineParserResultState;
