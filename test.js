const { internalBinding } = require('internal/test/binding');

console.log(internalBinding("builtins").builtinIds);

// console.log(Buffer)

// console.log(process.stdin)

// console.log(require('./lib/iconv-lite.js'))