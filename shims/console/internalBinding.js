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
            previewEntries(data, forceKV){
                /**
                 * TODO: implement with C binding
                 */
                let entry, isKV;
                return [entry, isKV]
            }
        }
        case 'config': return {
            hasInspector: false,     // if `true`, `internalBinding('inspector').console` will be called
        }                            // node's console has two impl.s: inspector impl. & native impl.
        case 'inspector': return {   // inspector impl. base on v8's mechanism, if `internalBinding('inspector').console`
            console: {}              // is unavailable, node will fallback to native impl.
        }                            // so impl.ing `internalBinding('inspector').console` is not at priority
    }
}