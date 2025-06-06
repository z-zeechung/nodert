
import * as qstd from 'qjs:std';
import * as bindings from 'bindings'
import * as timers from 'timers'


globalThis.bindings = {
    ...bindings,
    nextTick: timers.nextTick,
}

globalThis.setInterval = timers.setInterval
globalThis.setTimeout = timers.setTimeout
globalThis.clearInterval = timers.clearInterval
globalThis.clearTimeout = timers.clearTimeout
globalThis.setImmediate = timers.setImmediate
globalThis.clearImmediate = timers.clearImmediate


const mapping = {
    'primordials': 'primordials.js',
    'process': 'process.js',

    'assert': 'assert.corelib.js',
        'assert/strict': 'assert.strict.js',
    'buffer': 'buffer.corelib.js',
    'console': 'console.corelib.js',
    'diagnostics_channel': 'diagnostics_channel.corelib.js',
    'domain': 'domain.corelib.js',
    'events': 'events.corelib.js',
    'os': 'os.corelib.js',
    'path': 'path.corelib.js',
        'path/posix': 'path.posix.js',
        'path/win32': 'path.win32.js',
    'punycode': 'punycode.corelib.js',
    'querystring': 'querystring.corelib.js',
    'stream': 'stream.corelib.js',
    'string_decoder': 'string_decoder.corelib.js',
    'timers': 'timers.corelib.js',
    'url': 'url.corelib.js',
    'util': 'util.corelib.js',
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