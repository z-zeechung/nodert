
import * as qstd from 'qjs:std';
import * as bindings from 'bindings'
// import * as timers from 'timers'
// import {nextTick} from 'nextTick'
// import * as fs from 'fs'


globalThis.bindings = {
    ...bindings,
    // nextTick: (cb, ...args)=>{
    //     if(typeof cb !== 'function'){
    //         throw new Error('cb must be a function')
    //     }
    //     const cbWithArgs = ()=>{
    //         cb(...args)
    //     }
    //     return nextTick(cbWithArgs)
    // },
    // fs: {
    //     ...fs,
    //     constants: fs.constants(),
    // }
}

// globalThis.setInterval = (cb, delay, ...args)=>{
//     if(typeof cb !== 'function'){
//         throw new Error('cb must be a function')
//     }
//     delay = Math.max(1, Math.round(delay))
//     const cbWithArgs = ()=>{
//         cb(...args)
//     }
//     return timers.setInterval(cbWithArgs, delay)
// }
// globalThis.setTimeout = (cb, delay, ...args)=>{
//     if(typeof cb !== 'function'){
//         throw new Error('cb must be a function')
//     }
//     delay = Math.max(1, Math.round(delay))
//     const cbWithArgs = ()=>{
//         cb(...args)
//     }
//     return timers.setTimeout(cbWithArgs, delay)
// }
// globalThis.clearInterval = (id)=>{
//     if(typeof id !== 'number'){
//         throw new Error('id must be a number')
//     }
//     timers.clearInterval(id)
// }
// globalThis.clearTimeout = (id)=>{
//     if(typeof id !== 'number'){
//         throw new Error('id must be a number')
//     }
//     timers.clearTimeout(id)
// }
// globalThis.setImmediate = (cb, ...args)=>{
//     if(typeof cb !== 'function'){
//         throw new Error('cb must be a function')
//     }
//     const cbWithArgs = ()=>{
//         cb(...args)
//     }
//     return timers.setImmediate(cbWithArgs)
// }
// globalThis.clearImmediate = (id)=>{
//     if(typeof id !== 'number'){
//         throw new Error('id must be a number')
//     }
//     timers.clearImmediate(id)
// }


const mapping = {
    'primordials': 'primordials.js',
    'process': 'process.js',

    'internal/assert': 'internal/assert.js',
    'internal/constants': 'internal/constants.js',
    'internal/errors': 'internal/errors.js',
    'internal/util': 'internal/util.js',
    'internal/util/colors': 'internal/util/colors.js',
    'internal/util/debuglog': 'internal/util/debuglog.js',
    'internal/util/inspect': 'internal/util/inspect.js',
    'internal/util/types': 'internal/util/types.js',
    'internal/validators': 'internal/validators.js',

    'assert': 'assert.corelib.js',
        'assert/strict': 'assert.strict.js',
    'buffer': 'buffer.corelib.js',
    'console': 'console.corelib.js',
    'crypto': 'crypto.js',
    'diagnostics_channel': 'diagnostics_channel.corelib.js',
    'domain': 'domain.corelib.js',
    'events': 'events.corelib.js',
    'fs': 'fs.js',
    'os': 'os.js',
    'path': 'path.corelib.js',
        'path/posix': 'path.posix.js',
        'path/win32': 'path.win32.js',
    'punycode': 'punycode.corelib.js',
    'querystring': 'querystring.corelib.js',
    'stream': 'stream.corelib.js',
    'string_decoder': 'string_decoder.corelib.js',
    'timers': 'timers.corelib.js',
    'url': 'url.corelib.js',
    'util': 'util.js',
    'vm': 'vm.js',
    'zlib': 'zlib.corelib.js',
}

let modules = {};
let moduleLoadList = [];

globalThis.require = (name)=>{
    if (modules[name]) {
        return modules[name];
    }
    moduleLoadList.push(name)
    if(!mapping[name]) {throw ('Module not found: ' + name)}
    let path = 'lib/' + mapping[name];
    let script = qstd.loadFile(path)
    const module = {exports: {}};
    let func = qstd.evalScript(`function cjsModule(module, exports) {
        ${script}
    }; cjsModule;`)
    func.call(
        module.exports,
        module,
        module.exports,
    )
    modules[name] = module.exports;
    return module.exports;
}
Object.defineProperty(globalThis.require, "moduleLoadList", {
    get: () => moduleLoadList,
})