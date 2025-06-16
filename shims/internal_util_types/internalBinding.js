

const types = require('types');
const isDate = require('is-date');

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

module.exports = (_) => {
    const fns = {
        isExternal: (v)=>bindings.isExternal(v),
        isProxy: (v)=>bindings.isProxy(v),
        isModuleNamespaceObject: (v)=>bindings.isModuleNamespaceObject(v),
        isDate,
        isArgumentsObject: types.isArgumentsObject,
        isBigIntObject: types.isBigIntObject,
        isBooleanObject: types.isBooleanObject,
        isNumberObject: types.isNumberObject,
        isStringObject: types.isStringObject,
        isSymbolObject: types.isSymbolObject,
        isNativeError(e) {
            return isObject(e) &&
                (objectToString(e) === '[object Error]' || e instanceof Error);
        },
        isRegExp(re) {
            return isObject(re) && objectToString(re) === '[object RegExp]';
        },
        isAsyncFunction: types.isAsyncFunction,
        isGeneratorFunction: types.isGeneratorFunction,
        isGeneratorObject: types.isGeneratorObject,
        isPromise: types.isPromise,
        isMap: types.isMap,
        isSet: types.isSet,
        isMapIterator: types.isMapIterator,
        isSetIterator: types.isSetIterator,
        isWeakMap: types.isWeakMap,
        isWeakSet: types.isWeakSet,
        isArrayBuffer: types.isArrayBuffer,
        isDataView: types.isDataView,
        isSharedArrayBuffer: types.isSharedArrayBuffer,
    }
    fns['isAnyArrayBuffer'] = (o)=>{
        return fns.isArrayBuffer(o) || fns.isSharedArrayBuffer(o)
    }
    fns['isBoxedPrimitive'] = (o)=>{
        return fns.isNumberObject(o) || fns.isStringObject(o) || fns.isBooleanObject(o) || fns.isBigIntObject(o) || fns.isSymbolObject(o)
    }
    return fns
}