
class ERR_CONSOLE_WRITABLE_STREAM extends Error {
  constructor(stream) {
    const msg = `Console stream ${stream} is not writable`;
    super(msg);
    this.name = 'ERR_CONSOLE_WRITABLE_STREAM';
  }
}

class ERR_INCOMPATIBLE_OPTION_PAIR extends Error {
  constructor(option1, option2) {
    const msg = `Options "${option1}" and "${option2}" cannot be used together`;
    super(msg);
    this.name = 'ERR_INCOMPATIBLE_OPTION_PAIR';
  }
}

class ERR_INTERNAL_ASSERTION extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INTERNAL_ASSERTION';
  }
}

class ERR_INVALID_ARG_TYPE extends TypeError {
    constructor(name, type, value) {
        super(`The "${name}" argument must be of type ${type}. Received ${typeof value}`);
        this.code = 'ERR_INVALID_ARG_TYPE';
    }
}

class ERR_INVALID_ARG_VALUE extends TypeError {
    constructor(name, value, reason) {
        super(`The "${name}" argument must be ${reason}. Received ${value}`);
        this.code = 'ERR_INVALID_ARG_VALUE';
    }
}

class ERR_OUT_OF_RANGE extends RangeError {
    constructor(name, value, reason) {
        super(`The "${name}" argument is out of range. Received ${value}, ${reason}`);
        this.code = 'ERR_OUT_OF_RANGE';
    }
}


let maxStack_ErrorName;
let maxStack_ErrorMessage;

function isStackOverflowError(err) {
  if (maxStack_ErrorMessage === undefined) {
    try {
      function overflowStack() { overflowStack(); }
      overflowStack();
    } catch (err) {
      maxStack_ErrorMessage = err.message;
      maxStack_ErrorName = err.name;
    }
  }

  return err && err.name === maxStack_ErrorName &&
         err.message === maxStack_ErrorMessage;
}



module.exports = {
    codes: {
        ERR_CONSOLE_WRITABLE_STREAM,
        ERR_INCOMPATIBLE_OPTION_PAIR,
        ERR_INTERNAL_ASSERTION,
        ERR_INVALID_ARG_TYPE,
        ERR_INVALID_ARG_VALUE,
        ERR_OUT_OF_RANGE
    },
    isStackOverflowError
}