import uuid from 'uuid';
import castArray from 'lodash/castArray';
import isPlainObject from 'lodash/isPlainObject';
import config from '../configstore';
import logger from '../../lib/logger';

const log = logger('api:macros');
const CONFIG_KEY = 'macros';

export const getMacros = (controller) => {
    const records = castArray(config.get(CONFIG_KEY, []));

    let shouldUpdate = false;
    for (let i = 0; i < records.length; ++i) {
        if (!isPlainObject(records[i])) {
            records[i] = {};
        }

        const record = records[i];

        if (!record.id) {
            record.id = uuid.v4();
            shouldUpdate = true;
        }
    }

    if (shouldUpdate) {
        log.debug(`update sanitized records: ${JSON.stringify(records)}`);

        // Pass `{ silent changes }` will suppress the change event
        config.set(CONFIG_KEY, records, { silent: true });
    }

    return records.filter(record => {
        if (record.requires) {
            return record.requires(controller);
        } else {
            return true;
        }
    });
};

export const setMacros = (records) => {
    config.set(CONFIG_KEY, records);
};
