module.exports = (binding)=>{
    switch(binding){
        /** maybe i'd handle this once i finish `node:trace_events` */
        case 'trace_events': return {
            trace(a, b, c, d, e){},
            getCategoryEnabledBuffer(a){
                const buffer = Buffer.alloc(1);
                buffer[0] = 0;
                return buffer;
            }
        }
        case 'util': return {
            previewEntries(...args){
                const MAX_PREVIEW_LEN = 100;
                if(args.length===0){
                    return undefined
                }
                if(!(
                    types.isMap(args[0]) ||
                    types.isSet(args[0]) ||
                    types.isMapIterator(args[0]) ||
                    types.isSetIterator(args[0]) ||
                    types.isWeakMap(args[0]) ||
                    types.isWeakSet(args[0])
                )){
                    return undefined
                }
                let isMap = undefined
                if(args.length>=2){
                    isMap = types.isMap(args[0])         || 
                            types.isMapIterator(args[0]) ||
                            types.isWeakMap(args[0])
                }
                let ret = undefined
                if(types.isMap(args[0])){
                    ret = args[0].entries().slice(0,MAX_PREVIEW_LEN)
                }else if(types.isSet(args[0])){
                    ret = args[0].entries().slice(0,MAX_PREVIEW_LEN)
                }else if(types.isMapIterator(args[0])){   // filled with dummy values
                    ret = []                              // this sholud be enough, 
                }else if(types.isSetIterator(args[0])){   // since this function only 
                    ret = []                              // works for console api
                }else if(types.isWeakMap(args[0])){
                    ret = []
                }else if(types.isWeakSet(args[0])){
                    ret = []
                }
                if(isMap===undefined){
                    return ret
                }else{
                    return [ret, isMap]
                }
            },
        }
        case 'config': return {
            hasInspector: false,     // if `true`, `internalBinding('inspector').console` will be called
        }                            // node's console has two impl.s: inspector impl. & native impl.
        case 'inspector': return {   // inspector impl. base on v8's mechanism, if `internalBinding('inspector').console`
            console: {}              // is unavailable, node will fallback to native impl.
        }                            // so impl.ing `internalBinding('inspector').console` is not at priority
    }
}