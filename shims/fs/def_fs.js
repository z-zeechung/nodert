
class FSReqCallback {
    oncomplete(...args) {}
}

function bindFsBindings(asyncBinding, syncBinding, paramsCountWithoutReq) {
    return function(...args) {
        if (args.length > paramsCountWithoutReq) {
            asyncBinding(...args.slice(0, paramsCountWithoutReq), (err, ret)=>{
                let req = args[paramsCountWithoutReq]
                req.oncomplete(err, ret)
            })
        }else{
            return syncBinding(...args)
        }
    }
}

module.exports = {

    statValues: [], // STUB

    FSReqCallback,
    
    access: bindFsBindings(bindings.fs.access, bindings.fs.accessSync, 2),
}