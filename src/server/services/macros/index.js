import uuid from 'uuid';
import castArray from 'lodash/castArray';
import isPlainObject from 'lodash/isPlainObject';
import config from '../configstore';
import logger from '../../lib/logger';

const log = logger('api:macros');
const CONFIG_KEY = 'macros';

export const toolChangeMacroId = '3826c2d6-ade8-45fa-bcfe-cc718260dd82';

const createToolChangeMacro = () => {
    return {
        id: toolChangeMacroId,
        name: 'Tool Change',
        content: [
            '; Wait for the machine to finish',
            '%wait',
            '',
            '; Turn spindle off',
            'M5',
            '',
            '; Raise the z axis',
            'G53 G0 Z0',
            '',
            '; Move to the tool change position',
            'G53 G0 X[toolChangeX] Y[toolChangeY]',
            '',
            '; Wait for the machine to finish',
            '%wait',
            '',
            '; Prompt for tool change',
            'M6',
            '',
            '; Move to tool probe',
            'G59.9 G0 X0 Y0',
            '',
            '; Wait for the machine to finish',
            '%wait',
            '',
            '; Clear any active tool offset',
            'G49',
            '',
            '; Run the tool probe',
            'G37',
            '',
            '; Wait for the machine to finish',
            '%wait',
            '',
            '; Store the tool offset',
            'G59.9 G10 L10 P[tool]',
            '',
            '; Activate the tool offset',
            'G43 H[tool]',
            '',
            '; Raise the Z axis',
            'G53 G0 Z0',
        ].join('\n'),
        requires: (controller) => {
            return !controller.settings.firmware.smartM6;
        }
    };
};

export const getMacros = (controller) => {
    const records = castArray(config.get(CONFIG_KEY, []));

    let toolChangeFound = false;
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

        if (record.id === toolChangeMacroId) {
            toolChangeFound = true;
        }
    }

    if (!toolChangeFound) {
        records.push(createToolChangeMacro());

        shouldUpdate = true;
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
