// import * as bjson from 'qjs:bjson';
// globalThis.bjson = bjson;
import * as qstd from 'qjs:std';
globalThis.qstd = qstd;
import * as qos from 'qjs:os';
globalThis.qos = qos;

import * as os from 'os';
globalThis.os = os;
import * as constants from 'constants';
globalThis.constants = constants;
import * as util from 'util';
globalThis.util = util;

globalThis.primordials = {}
qstd.loadScript("node/lib/internal/per_context/primordials.js")

globalThis.global = globalThis

{
    let modules = {};
    let libdir = qos.readdir('lib')[0]

    function fileExists(path) {
        const [stat, err] = qos.stat(path);
        return err === 0 && (stat.mode & qos.S_IFMT) === qos.S_IFREG;
    }

    const specialMapping = {
        'internal/bootstrap/realm': 'bootstrap.js'
    }

    globalThis.require = (name) => {
        // print(`importing ${name}`)
        if(modules[name]){
            return modules[name]
        }
        // print(`importing ${name}`)
        if(specialMapping[name]){
            return require(specialMapping[name])
        }
        if(libdir.includes(name)){
            let path = 'lib/' + name;
            let script = qstd.loadFile(path)
            script = `(()=>{
                let module = {exports: {}};
                let exports = module.exports;
                ${script}
                ;return module.exports;
            })()`
            let ret = qstd.evalScript(script)
            modules[name] = ret;
            return ret;
        }
        if(fileExists(`node/lib/${name}.js`)){
            let script = qstd.loadFile(`node/lib/${name}.js`)
            script = `(()=>{
                let module = {exports: {}};
                let exports = module.exports;
                ${script}
                ;return module.exports;
            })()`
            let ret = qstd.evalScript(script)
            modules[name] = ret;
            return ret;
        }
        throw ('Module not found: ' + name)
    }
}

globalThis.process = require('process.js');

globalThis.internalBinding = require('internal_binding.js');

globalThis.Buffer = require('buffer').Buffer;





require('stream')