
// 检查是否是外部值（非内置对象）
function isExternal(obj) {
  return obj && typeof obj === 'object' && 
          !Object.getPrototypeOf(obj) === Object.prototype &&
          !Array.isArray(obj) &&
          !isDate(obj) &&
          !isRegExp(obj) &&
          !isNativeError(obj);
}

// 检查是否是 Date 对象
function isDate(obj) {
  return obj instanceof Date;
}

// 检查是否是 arguments 对象
function isArgumentsObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Arguments]';
}

// 检查是否是 BigInt 对象
function isBigIntObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === BigInt;
}

// 检查是否是 Boolean 对象
function isBooleanObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Boolean;
}

// 检查是否是 Number 对象
function isNumberObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Number;
}

// 检查是否是 String 对象
function isStringObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === String;
}

// 检查是否是 Symbol 对象
function isSymbolObject(obj) {
  return typeof obj === 'object' && obj !== null && obj.constructor === Symbol;
}

// 检查是否是原生 Error 对象
function isNativeError(obj) {
  return obj instanceof Error;
}

// 检查是否是 RegExp 对象
function isRegExp(obj) {
  return obj instanceof RegExp;
}

// 检查是否是异步函数
function isAsyncFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object AsyncFunction]';
}

// 检查是否是生成器函数
function isGeneratorFunction(obj) {
  return Object.prototype.toString.call(obj) === '[object GeneratorFunction]';
}

// 检查是否是生成器对象
function isGeneratorObject(obj) {
  return obj !== null && typeof obj === 'object' && 
          typeof obj.next === 'function' && 
          typeof obj.throw === 'function';
}

// 检查是否是 Promise 对象
function isPromise(obj) {
  return obj instanceof Promise || (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.then === 'function' &&
    typeof obj.catch === 'function'
  );
}

// 检查是否是 Map
function isMap(obj) {
  return obj instanceof Map;
}

// 检查是否是 Set
function isSet(obj) {
  return obj instanceof Set;
}

// 检查是否是 Map 迭代器
function isMapIterator(obj) {
  return Object.prototype.toString.call(obj) === '[object Map Iterator]';
}

// 检查是否是 Set 迭代器
function isSetIterator(obj) {
  return Object.prototype.toString.call(obj) === '[object Set Iterator]';
}

// 检查是否是 WeakMap
function isWeakMap(obj) {
  return obj instanceof WeakMap;
}

// 检查是否是 WeakSet
function isWeakSet(obj) {
  return obj instanceof WeakSet;
}

// 检查是否是 ArrayBuffer
function isArrayBuffer(obj) {
  return obj instanceof ArrayBuffer;
}

// 检查是否是 DataView
function isDataView(obj) {
  return obj instanceof DataView;
}

// 检查是否是 SharedArrayBuffer
function isSharedArrayBuffer(obj) {
  return obj instanceof SharedArrayBuffer;
}

// 检查是否是 Proxy
function isProxy(obj) {
  try {
    return obj !== null && typeof obj === 'object' && 
            Object.prototype.toString.call(obj) === '[object Object]' &&
            obj[Symbol.toStringTag] === undefined;
  } catch (e) {
    return false;
  }
}

// 检查是否是模块命名空间对象
function isModuleNamespaceObject(obj) {
  return obj !== null && 
          typeof obj === 'object' && 
          Object.prototype.toString.call(obj) === '[object Module]' &&
          Symbol.toStringTag in obj && 
          obj[Symbol.toStringTag] === 'Module';
}

// 检查是否是任意类型的 ArrayBuffer
function isAnyArrayBuffer(obj) {
  return isArrayBuffer(obj) || isSharedArrayBuffer(obj);
}

// 检查是否是包装的原始值对象
function isBoxedPrimitive(obj) {
  return isBooleanObject(obj) || 
          isNumberObject(obj) || 
          isStringObject(obj) || 
          isSymbolObject(obj) || 
          isBigIntObject(obj);
}

module.exports = {
  isExternal,
  isDate,
  isArgumentsObject,
  isBigIntObject,
  isBooleanObject,
  isNumberObject,
  isStringObject,
  isSymbolObject,
  isNativeError,
  isRegExp,
  isAsyncFunction,
  isGeneratorFunction,
  isGeneratorObject,
  isPromise,
  isMap,
  isSet,
  isMapIterator,
  isSetIterator,
  isWeakMap,
  isWeakSet,
  isArrayBuffer,
  isDataView,
  isSharedArrayBuffer,
  isProxy,
  isModuleNamespaceObject,
  isAnyArrayBuffer,
  isBoxedPrimitive,
}