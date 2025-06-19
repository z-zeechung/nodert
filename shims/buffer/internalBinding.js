module.exports = (name)=>{
    switch(name){
////////////// Handle this when dealing with Intl //////////////
        case 'config': return {
            hasIntl: false,
        }
        case 'icu': return {
            icuErrName: undefined,
            transcode: undefined,
        }
////////////////////////////////////////////////////////////////
        case 'buffer': return require('internal/buffer').bindings
        case 'util': return {
            constants: {
                ALL_PROPERTIES: 'ALL_PROPERTIES',
                ONLY_ENUMERABLE: 'ONLY_ENUMERABLE',
            },
            getOwnNonIndexProperties,
            isInsideNodeModules: (a, b) => false,
        }
    }
}

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