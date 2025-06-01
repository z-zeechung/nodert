
const {
  TypedArrayPrototypeGetSymbolToStringTag,
} = primordials;


function isTypedArray(value) {
  return TypedArrayPrototypeGetSymbolToStringTag(value) !== undefined;
}

function isSet(value) {
    return Object.prototype.toString.call(value) === '[object Set]';
}

function isMap(value) {
    return Object.prototype.toString.call(value) === '[object Map]';
}

function isSetIterator(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    
    try {
        const set = new Set();
        const iterator = set[Symbol.iterator]();
        return Object.getPrototypeOf(value) === Object.getPrototypeOf(iterator);
    } catch (e) {
        return false;
    }
}

function isMapIterator(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    
    try {
        const map = new Map();
        const iterator = map[Symbol.iterator]();
        return Object.getPrototypeOf(value) === Object.getPrototypeOf(iterator);
    } catch (e) {
        return false;
    }
}


module.exports = {
  isTypedArray, isSet, isMap, isSetIterator, isMapIterator,
}