module.exports = {
  // 检查是否是外部值（非内置对象）
  isExternal: function(obj) {
    return obj && typeof obj === 'object' && 
           !Object.getPrototypeOf(obj) === Object.prototype &&
           !Array.isArray(obj) &&
           !this.isDate(obj) &&
           !this.isRegExp(obj) &&
           !this.isNativeError(obj);
  },

  // 检查是否是 Date 对象
  isDate: function(obj) {
    return obj instanceof Date;
  },

  // 检查是否是 arguments 对象
  isArgumentsObject: function(obj) {
    return Object.prototype.toString.call(obj) === '[object Arguments]';
  },

  // 检查是否是 BigInt 对象
  isBigIntObject: function(obj) {
    return typeof obj === 'object' && obj !== null && obj.constructor === BigInt;
  },

  // 检查是否是 Boolean 对象
  isBooleanObject: function(obj) {
    return typeof obj === 'object' && obj !== null && obj.constructor === Boolean;
  },

  // 检查是否是 Number 对象
  isNumberObject: function(obj) {
    return typeof obj === 'object' && obj !== null && obj.constructor === Number;
  },

  // 检查是否是 String 对象
  isStringObject: function(obj) {
    return typeof obj === 'object' && obj !== null && obj.constructor === String;
  },

  // 检查是否是 Symbol 对象
  isSymbolObject: function(obj) {
    return typeof obj === 'object' && obj !== null && obj.constructor === Symbol;
  },

  // 检查是否是原生 Error 对象
  isNativeError: function(obj) {
    return obj instanceof Error;
  },

  // 检查是否是 RegExp 对象
  isRegExp: function(obj) {
    return obj instanceof RegExp;
  },

  // 检查是否是异步函数
  isAsyncFunction: function(obj) {
    return Object.prototype.toString.call(obj) === '[object AsyncFunction]';
  },

  // 检查是否是生成器函数
  isGeneratorFunction: function(obj) {
    return Object.prototype.toString.call(obj) === '[object GeneratorFunction]';
  },

  // 检查是否是生成器对象
  isGeneratorObject: function(obj) {
    return obj !== null && typeof obj === 'object' && 
           typeof obj.next === 'function' && 
           typeof obj.throw === 'function';
  },

  // 检查是否是 Promise 对象
  isPromise: function(obj) {
    return obj instanceof Promise || (
      obj !== null &&
      typeof obj === 'object' &&
      typeof obj.then === 'function' &&
      typeof obj.catch === 'function'
    );
  },

  // 检查是否是 Map
  isMap: function(obj) {
    return obj instanceof Map;
  },

  // 检查是否是 Set
  isSet: function(obj) {
    return obj instanceof Set;
  },

  // 检查是否是 Map 迭代器
  isMapIterator: function(obj) {
    return Object.prototype.toString.call(obj) === '[object Map Iterator]';
  },

  // 检查是否是 Set 迭代器
  isSetIterator: function(obj) {
    return Object.prototype.toString.call(obj) === '[object Set Iterator]';
  },

  // 检查是否是 WeakMap
  isWeakMap: function(obj) {
    return obj instanceof WeakMap;
  },

  // 检查是否是 WeakSet
  isWeakSet: function(obj) {
    return obj instanceof WeakSet;
  },

  // 检查是否是 ArrayBuffer
  isArrayBuffer: function(obj) {
    return obj instanceof ArrayBuffer;
  },

  // 检查是否是 DataView
  isDataView: function(obj) {
    return obj instanceof DataView;
  },

  // 检查是否是 SharedArrayBuffer
  isSharedArrayBuffer: function(obj) {
    return obj instanceof SharedArrayBuffer;
  },

  // 检查是否是 Proxy
  isProxy: function(obj) {
    try {
      return obj !== null && typeof obj === 'object' && 
             Object.prototype.toString.call(obj) === '[object Object]' &&
             obj[Symbol.toStringTag] === undefined;
    } catch (e) {
      return false;
    }
  },

  // 检查是否是模块命名空间对象
  isModuleNamespaceObject: function(obj) {
    return obj !== null && 
           typeof obj === 'object' && 
           Object.prototype.toString.call(obj) === '[object Module]' &&
           Symbol.toStringTag in obj && 
           obj[Symbol.toStringTag] === 'Module';
  },

  // 检查是否是任意类型的 ArrayBuffer
  isAnyArrayBuffer: function(obj) {
    return this.isArrayBuffer(obj) || this.isSharedArrayBuffer(obj);
  },

  // 检查是否是包装的原始值对象
  isBoxedPrimitive: function(obj) {
    return this.isBooleanObject(obj) || 
           this.isNumberObject(obj) || 
           this.isStringObject(obj) || 
           this.isSymbolObject(obj) || 
           this.isBigIntObject(obj);
  }
};