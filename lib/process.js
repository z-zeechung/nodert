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

    arch: '',       // TODO: impl C binding

    platform: '',   // TODO: impl C binding

    release: {
        name: '',
        lts: '',
        sourceUrl: '',
        headersUrl: '',
        libUrl: ''
    },

    moduleLoadList: [],

    binding(name) {
        // dummy, since we don't have node-like internalBinding
    },

    domain: undefined,   // deprecated and complex, let's do it some day

    exitCode: undefined,

    config: {},     /** OH MY GOD */

    dlopen(path){}, // load .node extension, we might do it MUCH later

    uptime(){
        // TODO: impl C binding
    },

    getActiveResourcesInfo(){
        // get unreleased resources
    },

    reallyExit(){
        // abruptly kill node process
        // TODO: impl C binding
    },

    cpuUsage(){
        // TODO: impl C binding
    },

    resourceUsage(){
        // TODO: impl C binding
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
    },

    kill(pid, signal='SIGTERM'){
        // TODO: impl C binding
    },

    exit(code=0){
        // TODO: impl C binding
    },

    hrtime(){
        // TODO: impl C binding
    },

    openStdin(){
        // TODO: impl C binding
    },

    allowedNodeEnvironmentFlags(){
        return new Set()
    },

    assert(){

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

    nextTick(){
        
    },

    sourceMapsEnabled: false,

    setSourceMapsEnabled(enabled){
        this.sourceMapsEnabled = enabled
    },

    stdout: (()=>{
        const WriteStream = require('stream').WriteStream
        class StdOut extends WriteStream {

        }
        return new StdOut()
    }),

    stdin: (()=>{
        const ReadStream = require('stream').ReadStream
        class StdIn extends ReadStream {

        }
        return new StdIn()
    }),
    
    stderr: (()=>{
        const WriteStream = require('stream').WriteStream
        class StdErr extends WriteStream {

        }
        return new StdErr()
    }),

    abort(){
        
    },

    umask(pid){
        // TODO: impl C binding
    },

    chdir(path){

    },

    cwd(){

    },

    env: {},    // TODO: impl C binding

    title: '',  // TODO: impl C binding

    argv: [],    // TODO: impl C binding

    execArgv: [],  // TODO: impl C binding

    argv0: '',  // TODO: impl C binding

    pid: 0,  // TODO: impl C binding

    ppid: 0,  // TODO: impl C binding

    execPath: '',  // TODO: impl C binding

    debugPort: 0,

    mainModule: null,

    report: {
        // TODO
    }
}