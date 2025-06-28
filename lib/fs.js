// STUB. TODO.

const handler = {
  get: function(target, property, receiver) {
    throw new Error(`Not implemented: \`${property}\` in \`fs\``)
  }
};

module.exports = new Proxy({}, handler);