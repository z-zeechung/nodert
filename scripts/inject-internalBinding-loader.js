
module.exports = function(source) {
    return "const internalBinding = require('internalBinding');\n\n" + source;
};