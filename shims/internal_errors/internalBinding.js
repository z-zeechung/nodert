
const os = require('os')

module.exports = (name)=>{
    switch(name){
        case 'os': return {
            getOSInformation: ()=>[
                os.type(), os.version(), os.release(), os.machine()
            ]
        }
        case 'util': return {
            privateSymbols: {
                arrow_message_private_symbol: 'arrow_message_private_symbol'
            }
        }
        case 'uv': return {
            getErrorMap: require('internal/util').getSystemErrorMap
        }
    }
}