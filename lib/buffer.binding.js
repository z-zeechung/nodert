const { Buffer } = require('buffer.js');

const createFromString = (str, encoding) => {
  return Buffer.from(str, encoding);
};

const byteLengthUtf8 = (string) => {
  return Buffer.byteLength(string, 'utf8');
};

const copy = (source, target, targetStart, sourceStart, sourceEnd) => {
  for(let i=sourceStart, j=targetStart; i<sourceEnd; i++, j++){
    target[j] = source[i];
  }
  return sourceEnd - sourceStart;
};

const compare = (a, b) => {
  return Buffer.compare(a, b);
};

const compareOffset = (a, b, targetStart, targetEnd, sourceStart, sourceEnd) => {
  const aSlice = a.subarray(sourceStart, sourceEnd);
  const bSlice = b.subarray(targetStart, targetEnd);
  return Buffer.compare(aSlice, bSlice);
};

const fill = (buffer, value, offset, end, encoding) => {
  return Buffer.prototype.fill.call(buffer, value, offset, end, encoding);
};

const indexOfBuffer = (buffer, search, offset) => {
  return Buffer.prototype.indexOf.call(buffer, search, offset);
};

const indexOfNumber = (buffer, value, offset) => {
  return Buffer.prototype.indexOf.call(buffer, value, offset);
};

const indexOfString = (buffer, value, offset, encoding) => {
  return Buffer.prototype.indexOf.call(buffer, value, offset, encoding);
};

const detachArrayBuffer = (buffer) => {
  const arrayBuffer = buffer.buffer;
  buffer.buffer = new ArrayBuffer(0); // Simulate detach
  return arrayBuffer;
};

const copyArrayBuffer = (source, target, targetStart, sourceStart, length) => {
  new Uint8Array(target, targetStart, length)
    .set(new Uint8Array(source, sourceStart, length));
};

const swapBytes = (buffer, bytesPerElement) => {
  const len = buffer.length - (buffer.length % bytesPerElement);
  for (let i = 0; i < len; i += bytesPerElement) {
    for (let j = 0; j < bytesPerElement / 2; j++) {
      const opposite = i + bytesPerElement - 1 - j;
      const temp = buffer[i + j];
      buffer[i + j] = buffer[opposite];
      buffer[opposite] = temp;
    }
  }
  return buffer;
};

const swap16 = (buffer) => {
  return Buffer.prototype.swap16.call(buffer);
};

const swap32 = (buffer) => {
  return Buffer.prototype.swap32.call(buffer);
};

const swap64 = (buffer) => {
  // Node.js doesn't have swap64, implement manually
  return swapBytes(buffer, 8);
};

const isUtf8 = (buffer) => {
  try {
    Buffer.prototype.toString.call(buffer, 'utf8');
    return true;
  } catch {
    return false;
  }
};

const isAscii = (buffer) => {
  return buffer.every(byte => byte <= 0x7F);
};

const kMaxLength = Buffer.poolSize;
// const kStringMaxLength = Buffer.constants.MAX_STRING_LENGTH;
const kStringMaxLength = kMaxLength     // browserify buffer并未提供kStringMaxLength常量，再想想办法

// Slice methods
function asciiSlice(start, end) {
  return Buffer.prototype.toString.call(this, 'ascii', start, end);
}
function base64Slice(start, end) {
  return Buffer.prototype.toString.call(this, 'base64', start, end);
}
function base64urlSlice(start, end) {
  return Buffer.prototype.toString.call(this, 'base64url', start, end);
}
function latin1Slice(start, end) {
  return Buffer.prototype.toString.call(this, 'latin1', start, end);
}
function hexSlice(start, end) {
  return Buffer.prototype.toString.call(this, 'hex', start, end);
}
function ucs2Slice(start, end) {
  return Buffer.prototype.toString.call(this, 'ucs2', start, end);
}
function utf8Slice(start, end) {
  return Buffer.prototype.toString.call(this, 'utf8', start, end);
}

// Write methods
function asciiWrite(string, offset, length) {
  return Buffer.prototype.write.call(this, string, offset, length, 'ascii');
}
function base64Write(string, offset, length) {
  return Buffer.prototype.write.call(this, string, offset, length, 'base64');
}
function base64urlWrite(string, offset, length) {
  return Buffer.prototype.write.call(this, string, offset, length, 'base64url');
}
function latin1Write(string, offset, length) {
  return Buffer.prototype.write.call(this, string, offset, length, 'latin1');
}
function hexWrite(string, offset, length) {
  return Buffer.prototype.write.call(this, string, offset, length, 'hex');
}
function ucs2Write(string, offset, length) {
  return Buffer.prototype.write.call(this, string, offset, length, 'ucs2');
}
function utf8Write(string, offset, length) {
  return Buffer.prototype.write.call(this, string, offset, length, 'utf8');
}

// Static write methods
function asciiWriteStatic(buffer, string, offset, length) {
  return Buffer.prototype.write.call(buffer, string, offset, length, 'ascii');
}
function base64WriteStatic(buffer, string, offset, length) {
  return Buffer.prototype.write.call(buffer, string, offset, length, 'base64');
}
function base64urlWriteStatic(buffer, string, offset, length) {
  return Buffer.prototype.write.call(buffer, string, offset, length, 'base64url');
}
function latin1WriteStatic(buffer, string, offset, length) {
  return Buffer.prototype.write.call(buffer, string, offset, length, 'latin1');
}
function hexWriteStatic(buffer, string, offset, length) {
  return Buffer.prototype.write.call(buffer, string, offset, length, 'hex');
}
function ucs2WriteStatic(buffer, string, offset, length) {
  return Buffer.prototype.write.call(buffer, string, offset, length, 'ucs2');
}
function utf8WriteStatic(buffer, string, offset, length) {
  return Buffer.prototype.write.call(buffer, string, offset, length, 'utf8');
}

// Zero fill toggle simulation
const getZeroFillToggle = () => {
  return 0; // Simplified simulation
};

module.exports =  {
  createFromString,
  byteLengthUtf8,
  copy,
  compare,
  compareOffset,
  fill,
  indexOfBuffer,
  indexOfNumber,
  indexOfString,
  detachArrayBuffer,
  copyArrayBuffer,
  swap16,
  swap32,
  swap64,
  isUtf8,
  isAscii,
  kMaxLength,
  kStringMaxLength,
  asciiSlice,
  base64Slice,
  base64urlSlice,
  latin1Slice,
  hexSlice,
  ucs2Slice,
  utf8Slice,
  asciiWrite,
  asciiWriteStatic,
  base64Write,
  base64WriteStatic,
  base64urlWrite,
  base64urlWriteStatic,
  latin1Write,
  latin1WriteStatic,
  hexWrite,
  hexWriteStatic,
  ucs2Write,
  ucs2WriteStatic,
  utf8Write,
  utf8WriteStatic,
  getZeroFillToggle
};