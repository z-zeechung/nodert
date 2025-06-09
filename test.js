const { internalBinding } = require('internal/test/binding');

console.log(internalBinding('uv').getErrorMap())

// for(let name in require('os').constants.signals) {
//     process.stdout.write(`C(${name}); `)
// }