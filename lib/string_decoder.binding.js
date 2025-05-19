module.exports = {
    kIncompleteCharactersStart: 0,
    kIncompleteCharactersEnd: 4,
    kMissingBytes: 4,
    kBufferedBytes: 5,
    kEncodingField: 6,
    kNumFields: 7,
    encodings: [
        'ascii',  'utf8',
        'base64', 'utf16le',
        'latin1', 'hex',
        'buffer', 'base64url'
    ],
    kSize: 7,
}