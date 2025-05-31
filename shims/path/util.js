function getLazy(initializer) {
  let value;
  let initialized = false;
  return function() {
    if (initialized === false) {
      value = initializer();
      initialized = true;
    }
    return value;
  };
}

function emitExperimentalWarning(name){}

const isWindows = process.platform === 'win32';
const isMacOS = process.platform === 'darwin';

module.exports = {
  getLazy,
  emitExperimentalWarning,
  isWindows,
  isMacOS
}