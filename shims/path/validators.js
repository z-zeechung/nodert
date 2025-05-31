const {ArrayIsArray} = primordials;

class ERR_INVALID_ARG_TYPE extends TypeError {
  constructor(name, type, value) {
    const msg = `The "${name}" argument must be of type ${type}. Received ${typeof value}`;
    super(msg);
    this.name = 'ERR_INVALID_ARG_TYPE';
  }
}

const kValidateObjectNone = 0;
const kValidateObjectAllowNullable = 1 << 0;
const kValidateObjectAllowArray = 1 << 1;
const kValidateObjectAllowFunction = 1 << 2;

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
};

const validateString = (value, name) => {
  if (typeof value !== 'string')
    throw new ERR_INVALID_ARG_TYPE(name, 'string', value);
};

module.exports = {
  validateObject,
  validateString
}