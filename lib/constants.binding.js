module.exports = {
    get os() {
        delete this.os;
        return this.os = constants.os();
    }
}