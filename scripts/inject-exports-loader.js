
module.exports = function(source) {
    const options = this.query;

    let e = ""
    for(let k in options) {
        e += k+":"+options[k]+","
    }

    const _exports = `
        module.exports = {
            ...module.exports,
            ${e}
        }
    `
    
    return source + "\n\n\n" + _exports;
};