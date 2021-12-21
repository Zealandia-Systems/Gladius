import ensureArray from 'ensure-array';

const fromPairs = (pairs) => {
    let index = -1;
    const length = !pairs ? 0 : pairs.length;
    const result = {};

    while (++index < length) {
        const pair = pairs[index];
        result[pair[0]] = pair[1];
    }

    return result;
};

const partitionWordsByGroup = (words = []) => {
    const groups = [];

    for (let i = 0; i < words.length; ++i) {
        const word = words[i];
        const letter = word[0];

        if (letter === 'G' || letter === 'M') {
            groups.push([word]);
            continue;
        }

        if (groups.length > 0) {
            groups[groups.length - 1].push(word);
        } else {
            groups.push([word]);
        }
    }

    return groups;
};

const re1 = new RegExp(/\s*\([^\)]*\)/g); // Remove anything inside the parentheses

const re2 = new RegExp(/\s*;.*/g); // Remove anything after a semi-colon to the end of the line, including preceding spaces

const re3 = new RegExp(/\s+/g);

const stripComments = (line) => {
    return line.replace(re1, '').replace(re2, '').replace(re3, ' ');
};

const re = /([a-zA-Z#\?\>][0-9\+\-]+(\.[0-9]*)?)|([\?\>][^\s]+)/igm;

export const parseLine = (line, options) => {
    options = options || {};
    options.flatten = !!options.flatten;
    options.noParseLine = !!options.noParseLine;

    let result = {
        line: line,
        ln: null,
        cmds: [],
        words: []
    };

    if (options.noParseLine) {
        return result;
    }

    let ln; // Line number

    let words = stripComments(line).match(re) || [];

    for (let i = 0; i < words.length; ++i) {
        let word = words[i];
        let letter = word[0].toUpperCase();
        let argument = word.slice(1);

        if (letter === '%') {
            result.cmds = (result.cmds || []).concat(line.trim());
            continue;
        }

        if (letter === 'N' && typeof ln === 'undefined') {
            ln = Number(argument);

            continue;
        }

        let value = Number(argument);

        if (Number.isNaN(value)) {
            value = argument;
        }

        if (options.flatten) {
            result.words.push(letter + value);
        } else {
            result.words.push([letter, value]);
        }
    }

    typeof ln !== 'undefined' && (result.ln = ln);

    return result;
};

const interpret = (() => {
    let cmd = '';

    return function (line, callback) {
        const data = parseLine(line);
        const groups = partitionWordsByGroup(ensureArray(data.words));

        for (let i = 0; i < groups.length; ++i) {
            const words = groups[i];
            const word = words[0] || [];
            const letter = word[0];
            const arg = word[1];

            if (letter === 'G' || letter === 'M' || letter === 'T') {
                cmd = letter + arg;
                const params = fromPairs(words.slice(1));
                callback(cmd, params);
            } else {
                // Use previous command if the line does not start with Gxx or Mxx
                // G0 XZ0.25
                //   X-0.5 Y0
                //   Z0.1
                const params = fromPairs(words);
                callback(cmd, params);
            }
        }
    };
})();

export default interpret;
