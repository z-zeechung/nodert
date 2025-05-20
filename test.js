const { internalBinding } = require('internal/test/binding');

console.log(internalBinding("string_decoder"));

// console.log(Buffer)