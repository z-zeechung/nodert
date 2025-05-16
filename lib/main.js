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

globalThis.process = {
    platform: qos.platform,
    arch: 'x64',
    env: qstd.getenviron()
}

globalThis.bindings = {}

bindings['credentials'] = {
    safeGetenv: qstd.getenv
}

bindings['constants'] = {
    get os() {
        delete this.os;
        return this.os = constants.os();
    }
}

bindings['os'] = {
    getHostname: os.getHostname,
    getLoadAvg: (arr) => undefined,
    getUptime: os.getUptime,
    getTotalMem: os.getTotalMem,
    getFreeMem: os.getFreeMem,
    getHomeDirectory: os.getHomeDirectory,
    getUserInfo: ()=>{return {
        uid: os.get_uid(),
        gid: os.get_gid(),
        username: os.get_username(),
        homedir: os.getHomeDirectory(),
        shell: os.get_shell(),
    }},
    getAvailableParallelism: ()=>20,
    getOSInformation: ()=>[
        os.get_sysname(),
        os.get_version(),
        os.get_release(),
        os.get_machine()
    ],
    isBigEndian: os.isBigEndian()
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

console.log(JSON.stringify(internalBinding("constants").os))
// console.log(constants.os())