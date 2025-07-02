
/**
 * 
 * This won't be actually functional until webstreams and TextEncoder are impled and exposed to `globalThis`
 * 
 */

const {
  ArrayFrom,
  MathMax,
  MathMin,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectSetPrototypeOf,
  PromisePrototypeThen,
  PromiseReject,
  PromiseWithResolvers,
  RegExpPrototypeExec,
  RegExpPrototypeSymbolReplace,
  StringPrototypeSplit,
  StringPrototypeToLowerCase,
  Symbol,
  SymbolIterator,
  SymbolToStringTag,
  Uint8Array,
} = primordials;

const {
  codes: {
    ERR_BUFFER_TOO_LARGE,
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_INVALID_STATE,
    ERR_INVALID_THIS,
  },
} = require('internal/errors');

const kHandle = Symbol('kHandle');

function isBlob(object) {
    return object?.[kHandle] !== undefined;
}

const handler = {
  get: function(target, property, receiver) {
    throw new Error('`kHandle` of `Blob` in `internal/blob` should not be accessed')
  }
};
const dummyKHandleObject = new Proxy({}, handler);

class Blob {
    constructor(...args) {  // TODO: implement
        throw new Error('`Blob` was not implemented in `internal/blob`');
    }
}

module.exports = {
    Blob,
    createBlob(handle, length, type = ''){
        throw new Error('`createBlob` was not implemented in `internal/blob`');
    },
    createBlobFromFilePath(path, options){  // TODO: implement
        throw new Error('`createBlobFromFilePath` was not implemented in `internal/blob`');
    },
    isBlob,
    kHandle,
    resolveObjectURL(url){  // TODO: deal with this when doing `url`
        throw new Error('`resolveObjectURL` was not implemented in `internal/blob`');
    }
}