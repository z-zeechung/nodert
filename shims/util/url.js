

const {
  Boolean,
} = primordials;

module.exports = {
    isURL(self) {
        return Boolean(self?.href && self.protocol && self.auth === undefined && self.path === undefined);
    }
}