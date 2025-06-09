
function stub(_){
    throw new Error('internalBinding(\'types\') not implemented');
}

module.exports = (_) => {
    const fns = {
        isExternal: stub,
        isDate: stub,
        isArgumentsObject: stub,
        isBigIntObject: stub,
        isBooleanObject: stub,
        isNumberObject: stub,
        isStringObject: stub,
        isSymbolObject: stub,
        isNativeError: stub,
        isRegExp: stub,
        isAsyncFunction: stub,
        isGeneratorFunction: stub,
        isGeneratorObject: stub,
        isPromise: stub,
        isMap: stub,
        isSet: stub,
        isMapIterator: stub,
        isSetIterator: stub,
        isWeakMap: stub,
        isWeakSet: stub,
        isArrayBuffer: stub,
        isDataView: stub,
        isSharedArrayBuffer: stub,
        isProxy: stub,
        isModuleNamespaceObject: stub,
    }
    fns['isAnyArrayBuffer'] = (o)=>{
        return fns.isArrayBuffer(o) || fns.isSharedArrayBuffer(o)
    }
    fns['isBoxedPrimitive'] = (o)=>{
        return fns.isNumberObject(o) || fns.isStringObject(o) || fns.isBooleanObject(o) || fns.isBigIntObject(o) || fns.isSymbolObject(o)
    }
    return fns
}