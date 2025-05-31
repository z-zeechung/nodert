
const {
  ArrayFrom,
  ArrayPrototypePush,
  ArrayPrototypeSlice,
  ArrayPrototypeSort,
  Error,
  ErrorCaptureStackTrace,
  FunctionPrototypeCall,
  ObjectDefineProperties,
  ObjectDefineProperty,
  ObjectFreeze,
  ObjectGetOwnPropertyDescriptor,
  ObjectGetOwnPropertyDescriptors,
  ObjectGetPrototypeOf,
  ObjectPrototypeHasOwnProperty,
  ObjectSetPrototypeOf,
  ObjectValues,
  Promise,
  ReflectApply,
  ReflectConstruct,
  RegExpPrototypeExec,
  RegExpPrototypeGetDotAll,
  RegExpPrototypeGetGlobal,
  RegExpPrototypeGetHasIndices,
  RegExpPrototypeGetIgnoreCase,
  RegExpPrototypeGetMultiline,
  RegExpPrototypeGetSource,
  RegExpPrototypeGetSticky,
  RegExpPrototypeGetUnicode,
  SafeMap,
  SafeSet,
  SafeWeakMap,
  SafeWeakRef,
  StringPrototypeReplace,
  StringPrototypeToLowerCase,
  StringPrototypeToUpperCase,
  Symbol,
  SymbolFor,
  SymbolReplace,
  SymbolSplit,
} = primordials;


// a may-be usable polyfill
function isNativeError(e) {
  return (
    typeof e === 'object' &&
    e !== null &&
    (
      Object.prototype.toString.call(e) === '[object Error]' ||
      e.constructor.name === 'Error' ||
      (Error.isPrototypeOf && Error.isPrototypeOf(e))
    )
  );
}

function isError(e) {
  return isNativeError(e) || e instanceof Error;
}

function join(output, separator) {
  let str = '';
  if (output.length !== 0) {
    const lastIndex = output.length - 1;
    for (let i = 0; i < lastIndex; i++) {
      str += output[i];
      str += separator;
    }
    str += output[lastIndex];
  }
  return str;
}

const colorRegExp = /\u001b\[\d\d?m/g;
function removeColors(str) {
  return StringPrototypeReplace(str, colorRegExp, '');
}


class WeakReference {
  #weak = null;
  // eslint-disable-next-line no-unused-private-class-members
  #strong = null;
  #refCount = 0;
  constructor(object) {
    this.#weak = new SafeWeakRef(object);
  }

  incRef() {
    this.#refCount++;
    if (this.#refCount === 1) {
      const derefed = this.#weak.deref();
      if (derefed !== undefined) {
        this.#strong = derefed;
      }
    }
    return this.#refCount;
  }

  decRef() {
    this.#refCount--;
    if (this.#refCount === 0) {
      this.#strong = null;
    }
    return this.#refCount;
  }

  get() {
    return this.#weak.deref();
  }
}


module.exports = {
  customInspectSymbol: SymbolFor('nodejs.util.inspect.custom'),
  isError,
  join,
  removeColors,
  WeakReference,
};