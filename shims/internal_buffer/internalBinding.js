const {
    Buffer,
    utf8ToBytes,
    bidirectionalIndexOf,
    kMaxLength,
    asciiSlice,
    base64Slice,
    latin1Slice,
    hexSlice,
    ucs2Slice,
    utf8Slice,
    asciiWrite,
    base64Write,
    latin1Write,
    hexWrite,
    ucs2Write,
    utf8Write,
} = require('buffer_shim')
const isValidUTF8 = require('utf-8-validate');
const {
  encodingsMap,
} = require('internal/util');

const reversedEncodingsMap = new Map();
for (const key in encodingsMap) {
    reversedEncodingsMap.set(encodingsMap[key], key);
}

module.exports = (name)=>{
    switch(name){
        case 'util': return {
            privateSymbols: {
                untransferable_object_private_symbol: 'untransferable_object_private_symbol',
            },
        }
        case 'buffer': return {
            byteLengthUtf8(string){
                return utf8ToBytes(string).length
            },
            compare: Buffer.compare,
            compareOffset(self, target, targetStart, sourceStart, targetEnd, sourceEnd){
                return Buffer.prototype.compare.call(self, target, targetStart, sourceStart, targetEnd, sourceEnd)
            },
            copy(source, target, targetStart, sourceStart, nb){
                return Buffer.prototype.copy.call(source, target, targetStart, sourceStart, nb)
            },
            fill(buf, value, offset, end, encoding){
                return Buffer.prototype.fill.call(buf, value, offset, end, encoding)
            },
            isAscii(input){
                const buffer = input instanceof Buffer ? input : Buffer.from(input);
                for (let i = 0; i < buffer.length; i++) {
                    if (buffer[i] > 127) {
                        return false;
                    }
                }
                return true;
            },
            isUtf8(input){
                const buffer = input instanceof Buffer ? input : Buffer.from(input);
                return isValidUTF8(buffer);
            },
            indexOfBuffer(buffer, val, byteOffset, encoding, dir){
                return bidirectionalIndexOf(buffer, val, byteOffset, reversedEncodingsMap.get(encoding), dir);
            },
            indexOfNumber(buffer, val, byteOffset, dir){
                return bidirectionalIndexOf(buffer, val, byteOffset, 'binary', dir);
            },
            indexOfString(buffer, val, byteOffset, encoding, dir){
                return bidirectionalIndexOf(buffer, val, byteOffset, reversedEncodingsMap.get(encoding), dir);
            },
            swap16: Buffer.prototype.swap16,
            swap32: Buffer.prototype.swap32,
            swap64: Buffer.prototype.swap64,
            kMaxLength,
            kStringMaxLength: Math.floor(kMaxLength / 8), 
            atob(input){
                return Buffer.from(input, 'base64').toString()
            },
            btoa(input){
                return Buffer.from(input).toString('base64')
            },
            asciiSlice(start, end){
                return asciiSlice(this, start, end)
            },
            base64Slice(start, end){
                return base64Slice(this, start, end)
            },
            base64urlSlice(start, end){
                // TODO
            },
            latin1Slice(start, end){
                return latin1Slice(this, start, end)
            },
            hexSlice(start, end){
                return hexSlice(this, start, end)
            },
            ucs2Slice(start, end){
                return ucs2Slice(this, start, end)
            },
            utf8Slice(start, end){
                return utf8Slice(this, start, end)
            },
            asciiWriteStatic: asciiWrite,
            base64Write(string, offset, length){
                return base64Write(this, string, offset, length)
            },
            base64urlWrite(string, offset, length){
                // TODO
            },
            latin1WriteStatic: latin1Write,
            hexWrite(string, offset, length){
                return hexWrite(this, string, offset, length)
            },
            ucs2Write(string, offset, length){
                return ucs2Write(this, string, offset, length)
            },
            utf8WriteStatic: utf8Write,
            getZeroFillToggle(){
                return [0]
            }
        }
    }
}