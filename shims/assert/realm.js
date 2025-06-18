class BuiltinModule{
    // if given module name is an internal module. for now let's simply return true
    static exists(id) {
        // return BuiltinModule.map.has(id);
        return true;
    }
}

module.exports = {
    BuiltinModule
}