import _ from 'lodash';

class SwordfishLineParserResultPosition {
    static parse(line) {
        if (!line.match(/^{/)) {
            return null;
        }

        try {
            line = JSON.parse(line);
        } catch (err) {
            return null;
        }

        const mpos = _.get(line, 'mpos');

        if (!mpos) {
            return null;
        }

        const wcs = Number(line.wcs);

        const wcsCmd =
            wcs === 0 ? 'G53' : `G5${Math.trunc((wcs - 1) / 10) + 4}.${((wcs - 1) % 10)}`;

        const payload = {
            activeState: _.get(line, 'state'),
            mpos: mpos,
            wpos: _.get(line, 'wpos'),
            ovF: _.get(line, 'ovF'),
            ovR: _.get(line, 'ovR'),
            ovS: _.get(line, 'ovS'),
            modal: {
                wcs: wcsCmd
            },
            spindle: _.get(line, 'spindle'),
        };

        return {
            type: SwordfishLineParserResultPosition,
            payload: payload,
        };
    }
}

export default SwordfishLineParserResultPosition;
