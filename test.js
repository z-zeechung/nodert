const { internalBinding } = require('internal/test/binding');

console.log(internalBinding('fs_dir'));

// const fs = require('fs');
// console.log(fs.constants);