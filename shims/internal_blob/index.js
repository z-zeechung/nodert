
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

const { Blob: _Blob } = require('fetch-blob');

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

class Blob extends _Blob {
    constructor(...args) {
        super(...args);
        this[kHandle] = dummyKHandleObject;
    }
    bytes() {
        if (!isBlob(this))
            return PromiseReject(new ERR_INVALID_THIS('Blob'));

        return PromisePrototypeThen(
            arrayBuffer(this),
            (buffer) => new Uint8Array(buffer));
    }
}

module.exports = {
    Blob,
    createBlob(handle, length, type = ''){
        throw new Error('`createBlob` was not implemented in `internal/blob`');
    },
    createBlobFromFilePath,
    isBlob,
    kHandle,
    resolveObjectURL(url){  // TODO: deal with this when doing `url`
        throw new Error('`resolveObjectURL` was not implemented in `internal/blob`');
    }
}