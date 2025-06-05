
const {
  Error,
  StringPrototypeReplace,
  SymbolFor,
} = primordials;


let customInspectSymbol = SymbolFor('nodejs.util.inspect.custom')

const isNativeError = require('internal/util/types').isNativeError
function isError(e) {
  // An error could be an instance of Error while not being a native error
  // or could be from a different realm and not be instance of Error but still
  // be a native error.
  return isNativeError(e) || e instanceof Error;
}

// The built-in Array#join is slower in v8 6.0
function join(output, separator) {
  let str = '';
  if (output.length !== 0) {
    const lastIndex = output.length - 1;
    for (let i = 0; i < lastIndex; i++) {
      // It is faster not to use a template string here
      str += output[i];
      str += separator;
    }
    str += output[lastIndex];
  }
  return str;
}

const colorRegExp = /\u001b\[\d\d?m/g; 
function removeColors(str) {
  return StringPrototypeReplace(str, colorRegExp, '');
}

module.exports = {
  customInspectSymbol,
  isError,
  join,
  removeColors,
}