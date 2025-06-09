const { internalBinding } = require('internal/test/binding');

// console.log(internalBinding('types'))

const set = new Set();
Array.from({length: 100000}).forEach((_, i) => set.add(i));
console.log(set);

// console.log(require('domexception'));