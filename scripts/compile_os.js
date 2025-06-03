const fs = require('fs');

// simply copy it to ./lib
fs.copyFileSync('shims/os.js', 'lib/os.corelib.js')