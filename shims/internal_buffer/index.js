module.exports = {
    ...require('internal/buffer'),
    bindings: require('internalBinding')('buffer')
}