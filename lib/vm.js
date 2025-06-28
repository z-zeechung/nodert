// STUB. TODO.

const handler = {
  get: function(target, property, receiver) {
    throw new Error(`Not implemented: \`${property}\` in \`vm\``)
  }
};

module.exports = new Proxy({}, handler);