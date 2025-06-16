const { DOMException: OriginalDOMException } = require('w3c-domcore-errors.js');
const uvErrorMap = require('uv_errmap.json');

function DOMException(message, name) {
  if (arguments.length === 1) {
    message = arguments[0];
    name = 'Error'; 
  }
  
  const exception = new OriginalDOMException(name);
  exception.message = message || exception.message;
  
  return exception;
}

DOMException.prototype = OriginalDOMException.prototype;
Object.assign(DOMException, OriginalDOMException);

DOMException.OriginalDOMException = OriginalDOMException;


function defineLazyProperties(target, moduleId, keys, enumerable = false) {
  for (const key of keys) {
    let value;
    let loaded = false;

    Object.defineProperty(target, key, {
      configurable: true,
      enumerable,
      get() {
        if (!loaded) {
          const mod = require(moduleId);
          value = mod[key];
          loaded = true;
        }
        return value;
      },
      set(newValue) {
        value = newValue;
        loaded = true;
      }
    });
  }
}


module.exports = (name)=>{
    switch (name) {
        case 'constants': return {
            os: require('os').constants,
        }
        case 'util': return {
            defineLazyProperties,
            privateSymbols: {
                arrow_message_private_symbol: 'arrow_message_private_symbol',
                decorated_private_symbol: 'decorated_private_symbol',
            },
            guessHandleType(fd){
                // TODO: implement
                throw new Error('guessHandleType is not implemented')
            },
            sleep(msec){
                bindings.sleep(msec)
            }
        }
        case 'types': return require('internal/util/types')
        case 'string_decoder': return {
            encodings: [
                'ascii',  'utf8',
                'base64', 'utf16le',
                'latin1', 'hex',
                'buffer', 'base64url'
            ]
        }
        case 'uv': return {
            getErrorMap: ()=>{
              let map = new Map()
              for(let code in uvErrorMap) {
                map.set(Number.parseInt(code), uvErrorMap[code])
              }
              return map
            }
        }
        case 'messaging': return {
            DOMException
        }
    }
}