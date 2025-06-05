module.exports = {
    arch: () => process.arch,
    availableParallelism: () => {
        // will be avaliable once we have workerpool
        throw new Error('Not implemented');
    },
    cpus:()=>{
        throw new Error('Not implemented');
    },
    endianness: ()=>{
        if(bindings.endianness()===1234){
            return 'LE';
        }else if(bindings.endianness()===4321){
            return 'BE';
        }else{
            throw new Error('Unknown endianness '+bindings.endianness());
        }
    },
    freemem: () => bindings.freemem(),
    getPriority: () => {
        throw new Error('Not implemented');
    },
    homedir:()=>bindings.homedir(),
    hostname:()=>bindings.hostname(),
    loadavg:()=>{
        throw new Error('Not implemented');
    },
    networkInterfaces:()=>{
        throw new Error('Not implemented');
    },
    platform:()=>process.platform,
    release:()=>bindings.osRelease(),
    setPriority: () => {
        throw new Error('Not implemented');
    },
    tmpdir() {
        if (process.platform === 'win32') {
            const path = process.env.TEMP ||
                process.env.TMP ||
                (process.env.SystemRoot || process.env.windir) + '\\temp';

            if (path.length > 1 && path[path.length - 1] === '\\' && path[path.length - 2] !== ':') {
                return StringPrototypeSlice(path, 0, -1);
            }

            return path;
        }
        return bindings.tmpdir() || '/tmp';
    },
    totalmem: () => bindings.totalmem(),
    type: () => bindings.osType(),
    userInfo: () => {
        return {
            uid: bindings.uid(),
            gid: bindings.gid(),
            username: bindings.username(),
            homedir: bindings.homedir(),
            shell: bindings.shell(),
        }
    },
    uptime: () => {
        throw new Error('Not implemented');
    },
    version: () => bindings.osVersion(),
    machine: () => bindings.osMachine(),
}

let isWindows = process.platform === 'win32';

primordials.ObjectDefineProperties(module.exports, {
    // TODO
    // constants: {
    //     __proto__: null,
    //     configurable: false,
    //     enumerable: true,
    //     value: constants,
    // },

    EOL: {
        __proto__: null,
        configurable: true,
        enumerable: true,
        writable: false,
        value: isWindows ? '\r\n' : '\n',
    },

    devNull: {
        __proto__: null,
        configurable: true,
        enumerable: true,
        writable: false,
        value: isWindows ? '\\\\.\\nul' : '/dev/null',
    },
});