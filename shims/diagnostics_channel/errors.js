
class ERR_INVALID_ARG_TYPE extends TypeError {
    constructor(name, type, value) {
        super(`The "${name}" argument must be of type ${type}. Received ${typeof value}`);
        this.code = 'ERR_INVALID_ARG_TYPE';
    }
}


module.exports = {
    codes: {
        ERR_INVALID_ARG_TYPE,
    },
}