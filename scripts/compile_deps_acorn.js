const fs = require('fs');

if(!fs.existsSync('lib/deps')){
    fs.mkdirSync('lib/deps');
}

const content = fs.readFileSync('node/deps/acorn/acorn/dist/acorn.js', 'utf8');

fs.writeFileSync('lib/deps/acorn.js', content, 'utf8');

const content2 = fs.readFileSync('node/deps/acorn/acorn-walk/dist/walk.js', 'utf8');

fs.writeFileSync('lib/deps/acorn-walk.js', content2, 'utf8');