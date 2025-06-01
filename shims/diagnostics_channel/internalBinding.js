module.exports = (_)=>{
    return {
        triggerUncaughtException(err, _){
            throw err;
        }
    }
}