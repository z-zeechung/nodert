const fs = require('fs');

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}

const content = fs.readFileSync('node/lib/internal/webidl.js', 'utf8');

const banner = "\n//////////////// THIS FILE WAS AUTO GENERATED, DO NOT MODIFY ////////////////////\n\n\n"

fs.writeFileSync('lib/internal/webidl.js', banner+content, 'utf8');