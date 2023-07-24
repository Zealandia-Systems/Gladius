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
            wcs === 0 ? 'G53' : `G5${Math.trunc(wcs / 10) + 4}.${(wcs % 10) - 1}`;

        const payload = {
            'activeState': _.get(line, 'state'),
            'mpos': mpos,
            'wpos': _.get(line, 'wpos'),
            'modal': {
                'wcs': wcsCmd
            }
        };

        return {
            type: SwordfishLineParserResultPosition,
            payload: payload
        };
    }
}

export default SwordfishLineParserResultPosition;
