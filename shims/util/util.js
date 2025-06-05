
// // browserify shim
// const node_util = require('node_util')

// // node's impl
// const {
//   format,
//   formatWithOptions,
//   inspect,
//   stripVTControlCharacters,
// } = require('internal/util/inspect');
// const types = require('internal/util/types');


// // hybridization of browserify shim and partial node's source impl
// /** This is our BURNING SOUL HYBRID INTERFACE!! */
// module.exports = {
//     format,
//     formatWithOptions,
//     inspect,
//     stripVTControlCharacters,
//     isRegExp: types.isRegExp,
//     isDate: types.isDate,
//     types,
//     ...node_util
// }

const node_util = require('node_util')

module.exports = {
    formatWithOptions(options, format, ...args) {
      return node_util.format(format, ...args);
    },
    ...node_util
}