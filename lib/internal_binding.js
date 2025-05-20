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
    get uv(){
        delete this.uv;
        return this.uv = require('uv.binding.js');
    },
    get util(){
        delete this.util;
        return this.util = require('util.binding.js');
    },
    get types(){
        delete this.types;
        return this.types = require('types.binding.js');
    },
    get options(){
        delete this.options;
        return this.options = require('options.binding.js');
    },
    get string_decoder(){
        delete this.string_decoder;
        return this.string_decoder = require('string_decoder.binding.js');
    },
    get trace_events(){
        delete this.trace_events;
        return this.trace_events = require('trace_events.binding.js');
    },
    get buffer(){
        delete this.buffer;
        return this.buffer = require('buffer.binding.js');
    },
    get config(){
        delete this.config;
        return this.config = require('config.binding.js');
    },
    get icu(){
        delete this.icu;
        return this.icu = require('icu.binding.js');
    },
    get errors(){
        delete this.errors;
        return this.errors = require('errors.binding.js');
    }
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