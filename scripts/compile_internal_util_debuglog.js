const fs = require('fs');

const content = fs.readFileSync('node/lib/internal/util/debuglog.js', 'utf8');

const itb = `
//////////////// THIS FILE WAS AUTO GENERATED, DO NOT MODIFY ////////////////////
const internalBinding = (_)=>{
    return {    // we might do this someday we have \`trace_events\`
        getCategoryEnabledBuffer: ()=>[0],
        trace(a, b, c, d) {
            throw new Error('trace is not yet supported');
        }
    }
}
/////////////////////////////////////////////////////////////////////////////////



`

if(!fs.existsSync('lib/internal')){
    fs.mkdirSync('lib/internal');
}
if(!fs.existsSync('lib/internal/util')){
    fs.mkdirSync('lib/internal/util');
}

fs.writeFileSync('lib/internal/util/debuglog.js', itb+content, 'utf8');