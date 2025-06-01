const {
    codes: {
        ERR_INVALID_ARG_TYPE,
    }
} = require('internal/errors');

const validateFunction = (value, name) => {
  if (typeof value !== 'function')
    throw new ERR_INVALID_ARG_TYPE(name, 'Function', value);
}

module.exports = {
    validateFunction,
}