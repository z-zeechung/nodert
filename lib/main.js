
'use strict'

// import * as bjson from 'qjs:bjson';
// globalThis.bjson = bjson;
import * as qstd from 'qjs:std';
globalThis.qstd = qstd;
import * as qos from 'qjs:os';
globalThis.qos = qos;

globalThis.global = globalThis

{
    let modules = {};
    let moduleLoadList = [];
    let libdir = qos.readdir('lib')[0]

    const specialMapping = {
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
        'vm': 'vm.corelib.js',
        'zlib': 'zlib.corelib.js',
    }

    globalThis.require = (name) => {
        if(modules[name]){
            return modules[name]
        }
        moduleLoadList.push(name)   // need improvement
        if(specialMapping[name]){
            return require(specialMapping[name])
        }
        if(libdir.includes(name)){
            let path = 'lib/' + name;
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
        throw ('Module not found: ' + name)
    }
    Object.defineProperty(globalThis.require, "moduleLoadList", {
        get: () => moduleLoadList,
    })
}

globalThis.primordials = {}
require('primordials.js')

globalThis.process = require('process.js');

globalThis.Buffer = require('buffer').Buffer;

globalThis.console = require('console').Console({
    stdout: process.stdout,
    stderr: process.stderr
});

require('util').log(require('util').types)