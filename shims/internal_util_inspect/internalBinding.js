
const ALL_PROPERTIES = 'ALL_PROPERTIES';
const ONLY_ENUMERABLE = 'ONLY_ENUMERABLE';
const kPending = 'kPending';
const kRejected = 'kRejected';


function getOwnNonIndexProperties(obj, filter) {
  const isIndexProperty = RegExp.prototype.test.bind(/^(0|[1-9]\d*)$/);
  
  const allProps = [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];
  
  return allProps.filter(prop => {
    if (typeof prop === 'string' && isIndexProperty(prop)) {
      const num = Number(prop);
      if (num >= 0 && num <= 4294967294) return false;
    }
    
    if (filter === ONLY_ENUMERABLE) {
      if (typeof prop === 'string') {
        const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        return descriptor?.enumerable ?? false;
      }
      return true;
    }
    
    return true;
  });
}


const types = require('internal/util/types')


module.exports = (name) => {
    switch(name){
        case 'config': return {
            hasIntl: false,
        }
        case 'util': return {
            constants: {
                ALL_PROPERTIES,
                ONLY_ENUMERABLE,
                kPending,
                kRejected,
            },
            getOwnNonIndexProperties,
            getPromiseDetails(promise) {
                if(!types.isPromise(promise)){
                    return undefined
                }
                const state = bindings.getPromiseState(promise);
                if(state === 0){
                    return [0]
                }else{
                    return [
                        state,
                        bindings.getPromiseResult(promise)
                    ]
                }
            },
            getProxyDetails(value, showProxy = false) {
                if(!types.isProxy(value)){
                    return undefined
                }
                if(showProxy){
                    return [
                        bindings.getProxyTarget(value),
                        bindings.getProxyHandler(value)
                    ]
                }else{
                    return bindings.getProxyTarget(value)
                }
            },
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
            getConstructorName(value) {
                if (obj === null) return 'null';
                if (obj === undefined) return 'undefined';
                
                switch (typeof obj) {
                    case 'boolean': return 'Boolean';
                    case 'number': return 'Number';
                    case 'string': return 'String';
                    case 'symbol': return 'Symbol';
                    case 'bigint': return 'BigInt';
                    case 'function': return 'Function';
                }
                
                try {
                    const constructor = obj.constructor;
                    if (constructor && constructor.name) {
                    return constructor.name;
                    }
                } catch (e) {
                    
                }
                
                const typeString = Object.prototype.toString.call(obj);
                return typeString.slice(8, -1);
            },
            getExternalValue(value) {
                throw new Error('getExternalValue is not implemented')
            }
        }
    }
}