// import * as bjson from 'qjs:bjson';
// globalThis.bjson = bjson;
import * as std from 'qjs:std';
globalThis.std = std;
import * as os from 'qjs:os';
globalThis.os = os;

globalThis.bindings = {}

bindings['credentials'] = {
    safeGetenv: std.getenv
}

globalThis.internalBinding = (name)=>{
    if(typeof name !== 'string'){
        throw new Error("Assertion `args[0]->IsString()' failed.")
    }
    if(bindings[name]){
        return bindings[name]
    }
    throw new Error(`No such binding: ${name}`)
}

print(internalBinding(true))