import _ from 'lodash';
import logger from '../../lib/logger';

const log = logger('controller:Swordfish');

class SwordfishLineParserResultFirmware {
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

        const firmware = _.get(line, 'firmware');

        if (!firmware) {
            return null;
        }

        return {
            type: SwordfishLineParserResultFirmware,
            payload: {
                firmware: firmware
            }
        };
    }
}

export default SwordfishLineParserResultFirmware;
