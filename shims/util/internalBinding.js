module.exports = (name) => {
    switch (name) {
        case 'config': return {
            hasIntl: false
        }
        case 'util': return {
            constants: {
                // 假设的常量值（具体值无法精确模拟）
                ALL_PROPERTIES: 'all',
                ONLY_ENUMERABLE: 'enumerable',
                kPending: '__stub_pending',
                kRejected: '__stub_rejected',
            },

            // 模拟：获取对象的非索引属性（字符串和 Symbol 键）
            getOwnNonIndexProperties(obj, filter) {
                const keys = [
                    ...Object.getOwnPropertyNames(obj),
                    ...Object.getOwnPropertySymbols(obj)
                ].filter(key => {
                    // 过滤索引属性（数字字符串）
                    if (typeof key === 'string') {
                        const num = +key;
                        if (Number.isInteger(num) && num >= 0) return false;
                    }
                    return true;
                });

                // 粗略模拟枚举性过滤（真实实现需要检查属性描述符）
                if (filter === this.constants.ONLY_ENUMERABLE) {
                    return keys.filter(key => {
                        try {
                            const desc = Object.getOwnPropertyDescriptor(obj, key);
                            return desc && desc.enumerable;
                        } catch (e) {
                            return false;
                        }
                    });
                }
                return keys;
            },

            // 存根：无法访问 Promise 内部状态
            getPromiseDetails(promise) {
                return ['__stub_state', '__stub_value']; // [state, result]
            },

            // 存根：无法获取 Proxy 内部细节
            getProxyDetails(proxy) {
                return ['__stub_target', '__stub_handler']; // [target, handler]
            },

            // 部分模拟：尝试预览可迭代对象的条目（仅支持部分内置类型）
            previewEntries(obj) {
                const MAX_PREVIEW = 3;
                const entries = [];

                try {
                    // Map/Set 的粗略模拟
                    if (obj instanceof Map || obj instanceof Set) {
                        let count = 0;
                        for (const entry of obj.entries()) {
                            entries.push(entry);
                            if (++count >= MAX_PREVIEW) break;
                        }
                        return [entries.length > 0, entries];
                    }

                    // Array/Object 的模拟
                    if (Array.isArray(obj)) {
                        return [true, obj.slice(0, MAX_PREVIEW)];
                    } else if (typeof obj === 'object') {
                        const keys = Object.keys(obj).slice(0, MAX_PREVIEW);
                        return [keys.length > 0, keys.map(k => [k, obj[k]])];
                    }
                } catch (e) {
                    // 忽略访问错误
                }

                return [false, []]; // 不可迭代
            },

            // 部分模拟：获取构造函数名称（简单场景）
            getConstructorName(obj) {
                // 基本类型处理
                if (obj === null) return 'null';
                if (obj === undefined) return 'undefined';

                // 检查内置标签
                const tag = Object.prototype.toString.call(obj).slice(8, -1);
                if (tag !== 'Object') return tag;

                // 通过 constructor 获取
                if (obj.constructor && obj.constructor.name) {
                    return obj.constructor.name;
                }

                return 'Object';
            },

            // 存根：无法访问外部值（C++ 绑定的值）
            getExternalValue(/* external */) {
                return '__stub_external_value';
            }
        }
        case 'types': return {
            isAsyncFunction: (value) =>
                typeof value === 'function' && Object.prototype.toString.call(value) === '[object AsyncFunction]',

            isGeneratorFunction: (value) =>
                typeof value === 'function' && Object.prototype.toString.call(value) === '[object GeneratorFunction]',

            isAnyArrayBuffer: (value) =>
                ArrayBuffer.isView(value) || value instanceof ArrayBuffer || '__stub_SharedArrayBuffer',

            isArrayBuffer: (value) =>
                value instanceof ArrayBuffer,

            isArgumentsObject: (value) =>
                Object.prototype.toString.call(value) === '[object Arguments]',

            isBoxedPrimitive: (value) =>
                value instanceof String || value instanceof Number ||
                value instanceof Boolean || value instanceof BigInt ||
                value instanceof Symbol,

            isDataView: (value) =>
                value instanceof DataView,

            // 需要底层绑定，无法检测真实外部值
            isExternal: (value) =>
                '__stub_isExternal' in value, // 标记为存根

            isMap: (value) =>
                value instanceof Map,

            isMapIterator: (value) =>
                typeof value === 'object' &&
                Object.prototype.toString.call(value) === '[object Map Iterator]',

            // ES模块命名空间对象有特殊行为
            isModuleNamespaceObject: (value) =>
                typeof value === 'object' && Symbol.toStringTag in value &&
                value[Symbol.toStringTag] === 'Module',

            isNativeError: (value) =>
                value instanceof Error,

            isPromise: (value) =>
                value instanceof Promise,

            isSet: (value) =>
                value instanceof Set,

            isSetIterator: (value) =>
                typeof value === 'object' &&
                Object.prototype.toString.call(value) === '[object Set Iterator]',

            isWeakMap: (value) =>
                value instanceof WeakMap,

            isWeakSet: (value) =>
                value instanceof WeakSet,

            isRegExp: (value) =>
                value instanceof RegExp,

            isDate: (value) =>
                value instanceof Date,

            isStringObject: (value) =>
                typeof value === 'object' && value instanceof String,

            isNumberObject: (value) =>
                typeof value === 'object' && value instanceof Number,

            isBooleanObject: (value) =>
                typeof value === 'object' && value instanceof Boolean,

            isBigIntObject: (value) =>
                typeof value === 'object' && value instanceof BigInt
        }
    }
}