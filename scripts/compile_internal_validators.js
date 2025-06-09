const fs = require('fs');

const content = fs.readFileSync('node/lib/internal/validators.js', 'utf8');

const itb = `
//////////////// THIS FILE WAS AUTO GENERATED, DO NOT MODIFY ////////////////////
const internalBinding = (_)=>{
    return {
        os: require('os').constants
    }
}
/////////////////////////////////////////////////////////////////////////////////



`

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}

fs.writeFileSync('lib/internal/validators.js', itb+content, 'utf8');