const { internalBinding } = require('internal/test/binding');

// console.log(internalBinding('buffer'))

const {Blob, kHandle} = require('internal/blob')

console.log(new Blob(Buffer.from('hello world'))[kHandle].slice)