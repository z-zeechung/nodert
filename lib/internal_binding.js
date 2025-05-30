bindings = {
    get credentials(){
        delete this.credentials;
        return this.credentials = require('credentials.binding.js');
    },
    get constants(){
        delete this.constants;
        return this.constants = require('constants.binding.js');
    },
    get os(){
        delete this.os;
        return this.os = require('os.binding.js');
    },
}

module.exports = (name)=>{
    if(typeof name !== 'string'){
        throw new Error("Assertion `args[0]->IsString()' failed.")
    }
    if(bindings[name]){
        return bindings[name]
    }
    throw new Error(`No such binding: ${name}`)
}