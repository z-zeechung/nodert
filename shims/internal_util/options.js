module.exports = {
    getOptionValue: (name)=>{
        switch(name){
            case '--pending-deprecation':
                return false;
            case '--no-deprecation':
                return false;
            default:
                throw new Error(`Unknown option ${name} in \`internal_util/options.getOptionValue\` shim`);
        }
    }
}