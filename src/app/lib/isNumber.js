/* eslint-disable no-restricted-globals */

export default (string) => {
    return (
        typeof string === 'string' &&
        !isNaN(string) &&
        !isNaN(parseFloat(string))
    );
};
