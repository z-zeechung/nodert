module.exports = {
    getEmbedderOptions: ()=>{return{
        shouldNotRegisterESMLoader: false,
        noGlobalSearchPaths: false,
        noBrowserGlobals: false
    }},
    envSettings: { kAllowedInEnvvar: 0, kDisallowedInEnvvar: 1 },
    types: {
        kNoOp: 0,
        kV8Option: 1,
        kBoolean: 2,
        kInteger: 3,
        kUInteger: 4,
        kString: 5,
        kHostPort: 6,
        kStringList: 7
    }
}