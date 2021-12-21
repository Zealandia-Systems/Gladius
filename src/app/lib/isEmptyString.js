export default (string) => {
    return (!string || /^\s*$/.test(string));
};
