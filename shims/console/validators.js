
const {
    ArrayIsArray,
    ArrayPrototypeIncludes,
    ArrayPrototypeJoin,
    ArrayPrototypeMap,
    NumberIsFinite,
    NumberIsInteger,
    NumberIsNaN,
    NumberMAX_SAFE_INTEGER,
    NumberMIN_SAFE_INTEGER,
    NumberParseInt,
    ObjectPrototypeHasOwnProperty,
    RegExpPrototypeExec,
    String,
    StringPrototypeToUpperCase,
    StringPrototypeTrim,
} = primordials;


const kValidateObjectNone = 0;
const kValidateObjectAllowNullable = 1 << 0;
const kValidateObjectAllowArray = 1 << 1;
const kValidateObjectAllowFunction = 1 << 2;
const kValidateObjectAllowObjects = kValidateObjectAllowArray |
    kValidateObjectAllowFunction;
const kValidateObjectAllowObjectsAndNull = kValidateObjectAllowNullable |
    kValidateObjectAllowArray |
    kValidateObjectAllowFunction;


const {
    codes: {
        ERR_INVALID_ARG_TYPE,
        ERR_INVALID_ARG_VALUE,
        ERR_OUT_OF_RANGE
    }
} = require('internal/errors');


const validateArray = (value, name, minLength = 0) => {
    if (!ArrayIsArray(value)) {
        throw new ERR_INVALID_ARG_TYPE(name, 'Array', value);
    }
    if (value.length < minLength) {
        const reason = `must be longer than ${minLength}`;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
    }
}

const validateInteger = (value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
    if (typeof value !== 'number')
        throw new ERR_INVALID_ARG_TYPE(name, 'number', value);
    if (!NumberIsInteger(value))
        throw new ERR_OUT_OF_RANGE(name, 'an integer', value);
    if (value < min || value > max)
        throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value);
}

const validateObject = (value, name, options = kValidateObjectNone) => {
    if (options === kValidateObjectNone) {
        if (value === null || ArrayIsArray(value)) {
            throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
        }

        if (typeof value !== 'object') {
            throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
        }
    } else {
        const throwOnNullable = (kValidateObjectAllowNullable & options) === 0;

        if (throwOnNullable && value === null) {
            throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
        }

        const throwOnArray = (kValidateObjectAllowArray & options) === 0;

        if (throwOnArray && ArrayIsArray(value)) {
            throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
        }

        const throwOnFunction = (kValidateObjectAllowFunction & options) === 0;
        const typeofValue = typeof value;

        if (typeofValue !== 'object' && (throwOnFunction || typeofValue !== 'function')) {
            throw new ERR_INVALID_ARG_TYPE(name, 'Object', value);
        }
    }
}

const validateOneOf = (value, name, oneOf) => {
    if (!ArrayPrototypeIncludes(oneOf, value)) {
        const allowed = ArrayPrototypeJoin(
            ArrayPrototypeMap(oneOf, (v) =>
                (typeof v === 'string' ? `'${v}'` : String(v))),
            ', ');
        const reason = 'must be one of: ' + allowed;
        throw new ERR_INVALID_ARG_VALUE(name, value, reason);
    }
}

const validateString = (value, name) => {
  if (typeof value !== 'string')
    throw new ERR_INVALID_ARG_TYPE(name, 'string', value);
}

const validateFunction = (value, name) => {
  if (typeof value !== 'function')
    throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
}


module.exports = {
    validateArray,
    validateInteger,
    validateObject,
    validateOneOf,
    validateString,
    validateFunction,
    kValidateObjectAllowArray
}