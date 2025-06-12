
const { expand } = require('dotenv-expand');
const dotenv = require('dotenv');


module.exports = (name)=>{
    if(name==='buffer') return {
        compare(a, b){
            // inputs are uint8arrays
            if (a.byteLength < b.byteLength) return -1;
            if (a.byteLength > b.byteLength) return 1;
            for (let i = 0; i < a.byteLength; i++) {
                if (a[i] < b[i]) return -1;
                if (a[i] > b[i]) return 1;
            }
            return 0;
        }
    }
    if(name==='util') return {
        parseEnv(content) {
            const parsed = dotenv.parse(content);

            const result = expand({
                parsed,
                ignoreProcessEnv: true, 
                processEnv: parsed,   
            }).parsed || {};

            return result;
        },
        getCallSites(frameCount){
            throw new Error('getCallSites is not implemented in `util` shim')
        }
    }
}