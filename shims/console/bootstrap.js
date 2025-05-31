class BuiltinModule {
    static exists(moduleName) {
        /**
         * this function checks if a module is an internal module.
         * for now, we simply return true
         */
        return true;
    }
}

module.exports = {
    BuiltinModule
}