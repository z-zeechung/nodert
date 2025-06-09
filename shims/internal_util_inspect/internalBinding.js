
const ALL_PROPERTIES = 'ALL_PROPERTIES';
const ONLY_ENUMERABLE = 'ONLY_ENUMERABLE';
const kPending = 'kPending';
const kRejected = 'kRejected';


function getOwnNonIndexProperties(obj, filter) {
  const isIndexProperty = RegExp.prototype.test.bind(/^(0|[1-9]\d*)$/);
  
  const allProps = [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];
  
  return allProps.filter(prop => {
    if (typeof prop === 'string' && isIndexProperty(prop)) {
      const num = Number(prop);
      if (num >= 0 && num <= 4294967294) return false;
    }
    
    if (filter === ONLY_ENUMERABLE) {
      if (typeof prop === 'string') {
        const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        return descriptor?.enumerable ?? false;
      }
      return true;
    }
    
    return true;
  });
}


function previewEntries(value, isIterator = false, maxItems = 100) {
    // unpreviewable, return empty array
    if (!value || typeof value !== 'object') {
        return [[], false];
    }
    
    // WeakMap/WeakSet
    if (value instanceof WeakMap || value instanceof WeakSet) {
        // 预留 C++ 绑定接口
        // 这里返回模拟数据，实际应由 C++ 实现
        throw new Error('WeakMap/WeakSet preview not implemented');
        return [[], value instanceof WeakMap];
    }
    
    try {
        if (value instanceof Map || (isIterator && isMapIterator(value))) {
            return handleMap(value, maxItems);
        }
        
        if (value instanceof Set || (isIterator && isSetIterator(value))) {
            return handleSet(value, maxItems);
        }
        
        if (Array.isArray(value)) {
            return [value.slice(0, maxItems), false];
        }
    } catch (e) {
        
    }
    
    return [[], false];
}

// map or map iterator
function handleMap(map, maxItems) {
    const entries = [];
    let count = 0;
    
    try {
        for (const [key, value] of map.entries()) {
            if (count >= maxItems) break;
            entries.push([key, value]);
            count++;
        }
    } catch (e) {
        
    }
    
    return [entries, true];
}

// set or set iterator
function handleSet(set, maxItems) {
    const values = [];
    let count = 0;
    
    try {
        for (const value of set.values()) {
            if (count >= maxItems) break;
            values.push(value);
            count++;
        }
    } catch (e) {
        
    }
    
    return [values, false];
}

function isMapIterator(value) {
    // 实际应由 C++ 实现
    // 这里使用简单检查作为示例
    throw new Error('isMapIterator not implemented');
    return value[Symbol.toStringTag] === 'Map Iterator';
}

function isSetIterator(value) {
    // 实际应由 C++ 实现
    // 这里使用简单检查作为示例
    throw new Error('isSetIterator not implemented');
    return value[Symbol.toStringTag] === 'Set Iterator';
}


module.exports = (name) => {
    switch(name){
        case 'config': return {
            hasIntl: false,
        }
        case 'util': return {
            constants: {
                ALL_PROPERTIES,
                ONLY_ENUMERABLE,
                kPending,
                kRejected,
            },
            getOwnNonIndexProperties,
            getPromiseDetails(promise) {
                throw new Error('getPromiseDetails is not implemented')
                // let state = ""
                // if getPromiseState(promise) is pending
                //     state = kPending
                // else if getPromiseState(promise) is rejected
                //     state = kRejected
                // let result = getPromiseResult(promise)
                // return [
                //     state, result
                // ]
            },
            getProxyDetails(value, showProxy = false) {
                throw new Error('getProxyDetails is not implemented')
                /**
                 * 检查给定的值是否是 Proxy 对象，并返回其内部细节（target 和 handler）。
                 * 
                 * @param {any} value - 要检查的值。
                 * @param {boolean} [showProxy=false] - 是否强制检查 Proxy 对象（即使默认不暴露）。
                 * 
                 * @returns {undefined | null | [target: any, handler: ProxyHandler<any>]}
                 *   - 如果 `value` 不是 Proxy，返回 `undefined`。
                 *   - 如果 `value` 是已撤销（revoked）的 Proxy，返回 `null`。
                 *   - 否则返回一个数组 `[target, handler]`，其中：
                 *     - `target` 是 Proxy 的目标对象。
                 *     - `handler` 是 Proxy 的处理器对象（包含 traps 如 `get`、`set` 等）。
                 */
            },
            previewEntries,
            getConstructorName(value) {
                throw new Error('getConstructorName is not implemented')
            },
            getExternalValue(value) {
                throw new Error('getExternalValue is not implemented')
            }
        }
    }
}