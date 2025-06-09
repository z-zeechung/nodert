module.exports = {
    emitWarningSync(warning, type, code, ctor) {
        process.emit('warning', createWarningObject(warning, type, code, ctor));
    }
}