module.exports = {
    toPathIfFileURL
}

const {
  Boolean,
} = primordials;

function isURL(self) {
  return Boolean(self?.href && self.protocol && self.auth === undefined && self.path === undefined);
}

function toPathIfFileURL(fileURLOrPath) {
  if (!isURL(fileURLOrPath))
    return fileURLOrPath;
  return require("url").fileURLToPath(fileURLOrPath);
}