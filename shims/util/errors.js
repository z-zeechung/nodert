
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

class ERR_INTERNAL_ASSERTION extends Error {
  constructor(message) {
    super(message);
    this.name = 'ERR_INTERNAL_ASSERTION';
  }
}

module.exports = {
  isStackOverflowError,
  codes: {
    ERR_INTERNAL_ASSERTION
  }
}