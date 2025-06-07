
let cwd = bindings.cwd()

module.exports = {
    version: '22.16.0',

    // some libraries may check the features enabled in Node.js based on `process.versions`, so we should mimic it.
    versions: {
        node: this.version,
        acorn: '',
        ada: '',
        ares: '',
        base64: '',
        brotli: '',
        cjs_module_lexer: '',
        cldr: '',
        icu: '',
        llhttp: '',
        modules: '',
        napi: '',
        nghttp: '',
        nghttp2: '',
        ngtcp2: '',
        openssl: '',
        simdutf: '',
        tz: '',
        undici: '',
        unicode: '',
        uv: '',
        uvwasi: '',
        v8: '',
        zlib: '',
    },

    arch: bindings.arch(),

    platform: bindings.platform(),

    release: {
        name: '',
        lts: '',
        sourceUrl: '',
        headersUrl: '',
        libUrl: ''
    },

    get moduleLoadList(){
        return require.moduleLoadList
    },

    binding(name) {
        // dummy, since we don't have node-like internalBinding
        throw new Error('not implemented');
    },

    domain: undefined,   // deprecated and complex, let's do it some day

    exitCode: undefined,

    config: {},     /** OH MY GOD */

    dlopen(path){
        // load .node extension, we might do it MUCH later
        throw new Error('not implemented');
    }, 

    uptime(){
        // TODO: impl C binding
        throw new Error('not implemented');
    },

    getActiveResourcesInfo(){
        // get unreleased resources
        throw new Error('not implemented');
    },

    reallyExit(code){
        let exitCode = code
        if(code===undefined){
            exitCode = this.exitCode || 0
        }
        bindings.reallyExit(exitCode)
    },

    cpuUsage(){
        // TODO: impl C binding
        throw new Error('not implemented');
    },

    resourceUsage(){
        // TODO: impl C binding
        throw new Error('not implemented');
        return {
            userCPUTime: 0,
            systemCPUTime: 0,
            maxRSS: 0,
            sharedMemorySize: 0,
            unsharedDataSize: 0,
            unsharedStackSize: 0,
            minorPageFault: 0,
            majorPageFault: 0,
            swappedOut: 0,
            fsRead: 0,
            fsWrite: 0,
            ipcSent: 0,
            ipcReceived: 0,
            signalsCount: 0,
            voluntaryContextSwitches: 0,
            involuntaryContextSwitches: 0
        }
    },

    memoryUsage(){
        // TODO: impl C binding
        throw new Error('not implemented');
        return {
            rss: 0,
            heapTotal: 0,
            heapUsed: 0,
            external: 0,
            arrayBuffers: 0
        }
    },

    constrainedMemory(){
        // TODO: impl C binding
        throw new Error('not implemented');
    },

    kill(pid, signal='SIGTERM'){
        if(this.platform=='win32'){
            if(signal!==0){
                signal = 9
            }
        }else{
            // posix
            throw new Error('not implemented');
        }
        return bindings.kill(pid, signal)
    },

    exit(code){
        let exitCode = code
        if(code===undefined){
            exitCode = this.exitCode || 0
        }
        bindings.exit(exitCode)
    },

    hrtime(){
        let nanosec = bindings.hrtime()
        let sec = Math.floor(nanosec / 1e9)
        let nsec = nanosec % 1e9
        return [sec, nsec]
    },

    openStdin(){
        // TODO: impl C binding
    },

    allowedNodeEnvironmentFlags(){
        return new Set()
    },

    assert(condition, message){
        return require('assert').ok(condition, message)
    },

    features: {
        inspector: true,
        debug: false,
        uv: true,
        ipv6: true,
        tls_alpn: true,
        tls_sni: true,
        tls_ocsp: true,
        tls: true,
        cached_builtins: true,
    },

    setUncaughtExceptionCaptureCallback(){
        
    },

    hasUncaughtExceptionCaptureCallback(){
        
    },

    emitWarning(){
        
    },

    nextTick: bindings,

    sourceMapsEnabled: false,

    setSourceMapsEnabled(enabled){
        this.sourceMapsEnabled = enabled
    },

    stdout: (()=>{
        const Writable = require('stream').Writable
        class StdOut extends Writable {
            _write(chunk, encoding, callback) {
                bindings.stdout(chunk);
                callback();
            }
        }
        return new StdOut()
    })(),

    // stdin: (()=>{
    //     const ReadStream = require('stream').ReadStream
    //     class StdIn extends ReadStream {

    //     }
    //     return new StdIn()
    // })(),
    
    stderr: (()=>{
        const Writable = require('stream').Writable
        class StdErr extends Writable {
            _write(chunk, encoding, callback){
                bindings.stderr(chunk);
                callback();
            }
        }
        return new StdErr()
    })(),

    abort(){
        bindings.abort()
    },

    umask(pid){
        if (pid) {
            return bindings.umask(pid)
        } else {
            return bindings.umask()
        }
    },

    chdir(path){
        cwd = require('path').resolve(path)
    },

    cwd(){
        return cwd
    },

    // encoding issue
    env: bindings.env(),    

    title: bindings.title(), 

    argv: [...bindings.argv()],   

    execArgv: [],   // we haven't yet add any `--xxx` param, so for now this is always empty

    get argv0() { return this.argv[0]; },

    pid: bindings.pid(),  

    get ppid(){
        return bindings.ppid()
    },

    execPath: bindings.execPath(),

    debugPort: 0,

    mainModule: null,

    report: {
        // TODO
    }
}