
const handler = {
  get: function(target, property, receiver) {
    if(target[property]){
      return target[property];
    }
    throw new Error(`fs api ${property} was not implemented`);
  }
};

module.exports = (name)=>{
    switch(name){
        case 'constants': return {
            fs: bindings.fsConstants(),
            os: bindings.osConstants(),
        }
        case 'fs': return new Proxy(require('def_fs.js'), handler)
        case 'fs_dir': return new Proxy({}, handler)
        case 'uv': return {
            get UV_ENOSPC() {
                function getNumber(){
                    for(let [code, [name, _]] of require('util').getSystemErrorMap().entries()){
                        if(name === 'ENOSPC'){
                            return code;
                        }
                    }
                    throw new Error('Error in `fs` internalBinding: UV_ENOSPC not found');
                }
                let number = getNumber();
                delete this.UV_ENOSPC;
                this.UV_ENOSPC = number;
                return number;
            }
        }
        case 'fs_event_wrap': return {
            FSEvent: class {
                constructor() {
                    throw new Error(`fs api FSEvent was not implemented`);
                }
            }
        }
    }
}