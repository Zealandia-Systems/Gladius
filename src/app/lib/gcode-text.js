import ensureArray from 'ensure-array';
import i18n from './i18n';

export default (word, group, object) => {
    const resText = {
        // Motion
        'G0': i18n._('Rapid Move (G0)', { ns: 'gcode' }),
        'G1': i18n._('Linear Move (G1)', { ns: 'gcode' }),
        'G2': i18n._('CW Arc (G2)', { ns: 'gcode' }),
        'G3': i18n._('CCW Arc (G3)', { ns: 'gcode' }),
        'G38.2': i18n._('Probing (G38.2)', { ns: 'gcode' }),
        'G38.3': i18n._('Probing (G38.3)', { ns: 'gcode' }),
        'G38.4': i18n._('Probing (G38.4)', { ns: 'gcode' }),
        'G38.5': i18n._('Probing (G38.5)', { ns: 'gcode' }),
        'G80': i18n._('Cancel Mode (G80)', { ns: 'gcode' }),

        // Plane
        'G17': i18n._('XY Plane (G17)', { ns: 'gcode' }),
        'G18': i18n._('XZ Plane (G18)', { ns: 'gcode' }),
        'G19': i18n._('YZ Plane (G19)', { ns: 'gcode' }),

        // Units
        'G20': i18n._('Inches (G20)', { ns: 'gcode' }),
        'G21': i18n._('Millimeters (G21)', { ns: 'gcode' }),

        // Path
        'G61': i18n._('Exact Path (G61)', { ns: 'gcode' }),
        'G61.1': i18n._('Exact Stop (G61.1)', { ns: 'gcode' }),
        'G64': i18n._('Continuous (G64)', { ns: 'gcode' }),

        // Distance
        'G90': i18n._('Absolute (G90)', { ns: 'gcode' }),
        'G91': i18n._('Relative (G91)', { ns: 'gcode' }),

        // Feed Rate
        'G93': i18n._('Inverse Time (G93)', { ns: 'gcode' }),
        'G94': i18n._('Units/Min (G94)', { ns: 'gcode' }),

        // Tool Length Offset
        'G43.1': i18n._('Active Tool Offset (G43.1)', { ns: 'gcode' }),
        'G49': i18n._('No Tool Offset (G49)', { ns: 'gcode' }),

        // Program
        'M0': i18n._('Program Stop (M0)', { ns: 'gcode' }),
        'M1': i18n._('Optional Program Stop (M1)', { ns: 'gcode' }),
        'M2': i18n._('Program End (M2)', { ns: 'gcode' }),
        'M30': i18n._('Program End and Rewind (M30)', { ns: 'gcode' }),

        // Spindle
        'M3': i18n._('Spindle On, CW (M3)', { ns: 'gcode' }),
        'M4': i18n._('Spindle On, CCW (M4)', { ns: 'gcode' }),
        'M5': i18n._('Spindle Off (M5)', { ns: 'gcode' }),

        // Coolant
        'M7': i18n._('Mist Coolant On (M7)', { ns: 'gcode' }),
        'M8': i18n._('Flood Coolant On (M8)', { ns: 'gcode' }),
        'M9': i18n._('Coolant Off (M9)', { ns: 'gcode' })
    };

    const regex = new RegExp('G(\\d\\d)\\.(\\d)');

    const splitWCS = (wcs) => {
        const result = regex.exec(wcs);

        if (result === undefined || result === null) {
            return wcs;
        }

        const code = Number(result[1]);
        const subcode = Number(result[2]);

        return { code, subcode };
    };

    const wcsToP = (wcs) => {
        const { code, subcode } = splitWCS(wcs);

        return ((code - 54) * 10) + subcode + 1;
    };

    const words = ensureArray(word)
        .map(word => {
            if (regex.test(word)) {
                return `${word} (P${wcsToP(word)})`;
            }

            return (resText[word] || word);
        });

    return (words.length > 1) ? words : words[0];
};
