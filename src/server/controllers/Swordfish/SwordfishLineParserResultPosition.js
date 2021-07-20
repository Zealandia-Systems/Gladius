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

        const payload = {
            activeState: _.get(line, 'state'),
            mpos: mpos,
            wpos: _.get(line, 'wpos'),
            modal: {
                wcs:
                    {
                        0: 'G53', // Machine coordinate system
                        1: 'G54', // Coordinate system 1
                        2: 'G55', // Coordinate system 2
                        3: 'G56', // Coordinate system 3
                        4: 'G57', // Coordinate system 4
                        5: 'G58', // Coordinate system 5
                        6: 'G59', // Coordinate system 6
                    }[line.wcs] || '',
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
