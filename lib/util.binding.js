module.exports = {
    privateSymbols: {
        arrow_message_private_symbol: Symbol.for('node:arrowMessage'),
        contextify_context_private_symbol: Symbol.for('node:contextify:context'),
        decorated_private_symbol: Symbol.for('node:decorated'),
        host_defined_option_symbol: Symbol.for('node:host_defined_option_symbol'),
        napi_type_tag: Symbol.for('node:napi:type_tag'),
        napi_wrapper: Symbol.for('node:napi:wrapper'),
        untransferable_object_private_symbol: Symbol.for('node:untransferableObject'),
        exit_info_private_symbol: Symbol.for('node:exit_info_private_symbol'),
        require_private_symbol: Symbol.for('node:require_private_symbol'),
    },
    constants: {
        kPending: 0,
        kFulfilled: 1,
        kRejected: 2,
        kExiting: 0,
        kExitCode: 1,
        kHasExitCode: 2,
        ALL_PROPERTIES: 0,
        ONLY_WRITABLE: 1,
        ONLY_ENUMERABLE: 2,
        ONLY_CONFIGURABLE: 4,
        SKIP_STRINGS: 8,
        SKIP_SYMBOLS: 16
    },
    getPromiseDetails: function(promise) {
        if(!this.isPromise(promise)) {
            return undefined;
        }
        const state = util.getPromiseState(promise);
        switch(state){
            case 0: return [0];
            case 1: return [1, util.getPromiseResult(promise)];
            case 2: return [2, util.getPromiseResult(promise)];
        }
    },
    isArrayBuffer: function(value) {
        return value instanceof ArrayBuffer || 
            (value != null && value.constructor && value.constructor.name === 'ArrayBuffer');
    },
    isArrayBufferView: function(value) {
        return ArrayBuffer.isView(value);
    },
    isAsyncFunction: function(value) {
        return typeof value === 'function' && 
            value.constructor && 
            value.constructor.name === 'AsyncFunction';
    },
    isDataView: function(value) {
        return value instanceof DataView || 
            (value != null && value.constructor && value.constructor.name === 'DataView');
    },
    isDate: function(value) {
        return value instanceof Date || 
            (value != null && value.constructor && value.constructor.name === 'Date');
    },
    isExternal: function(value) {
        return false;
    },
    isMap: function(value) {
        return value instanceof Map || 
            (value != null && value.constructor && value.constructor.name === 'Map');
    },
    isMapIterator: function(value) {
        return Object.prototype.toString.call(value) === '[object Map Iterator]';
    },
    isNativeError: function(value) {
        return value instanceof Error || 
            (value != null && value.constructor && 
                (value.constructor.name === 'Error' || 
                value.constructor.name === 'EvalError' || 
                value.constructor.name === 'RangeError' || 
                value.constructor.name === 'ReferenceError' || 
                value.constructor.name === 'SyntaxError' || 
                value.constructor.name === 'TypeError' || 
                value.constructor.name === 'URIError'));
    },
    isPromise: function(value) {
        return value instanceof Promise || 
            (value != null && typeof value.then === 'function' && typeof value.catch === 'function');
    },
    isRegExp: function(value) {
        return value instanceof RegExp || 
            (value != null && value.constructor && value.constructor.name === 'RegExp');
    },
    isSet: function(value) {
        return value instanceof Set || 
            (value != null && value.constructor && value.constructor.name === 'Set');
    },
    isSetIterator: function(value) {
        return Object.prototype.toString.call(value) === '[object Set Iterator]';
    },
    isTypedArray: function(value) {
        return ArrayBuffer.isView(value) && !(value instanceof DataView);
    },
    isUint8Array: function(value) {
        return value instanceof Uint8Array || 
            (value != null && value.constructor && value.constructor.name === 'Uint8Array');
    },
    isAnyArrayBuffer: function(value) {
        return this.isArrayBuffer(value) || 
            this.isSharedArrayBuffer(value);
    },
}