
function error(errno){
    return errno==0?undefined:new Error(errno)
}
function errorSync(errno){
    if(errno!=0) throw new Error(errno)
}

class FSReqCallback {
    oncomplete(...args) {}
}

module.exports = {

    statValues: [], // STUB

    FSReqCallback,
    access(path, mode, req){
        if(req){
            bindings.fs.access(path, mode, ([errno, _])=>{
                req.oncomplete(error(errno));
            })
        }else{
            const [errno, _] = bindings.fs.accessSync(path, mode)
            errorSync(errno)
        }
    },
    existsSync(path){
        const [errno, _] = bindings.fs.accessSync(path, bindings.fsConstants.F_OK)
        return errno==0
    },
    rename(path, newPath, req){
        if(req){
            bindings.fs.rename(path, newPath, ([errno, _])=>{
                req.oncomplete(error(errno));
            })
        }else{
            const [errno, _] = bindings.fs.renameSync(path, newPath)
            errorSync(errno)
        }
    },
    rmdir(path, req){
        if(req){
            bindings.fs.rmdir(path, ([errno, _])=>{
                req.oncomplete(error(errno));
            })
        }else{
            const [errno, _] = bindings.fs.rmdirSync(path)
            errorSync(errno)
        }
    },
    mkdir(path, mode, recursive, req){
        if(req){
            bindings.fs.mkdir(path, mode, recursive, ([errno, _])=>{
                req.oncomplete(error(errno));
            })
        }else{
            const [errno, _] = bindings.fs.mkdirSync(path, mode, recursive)
            errorSync(errno)
        }
    },
    fstat(fd, useBigint, req, throwIfNoEntry){
        if(req){
            bindings.fs.fstat(fd, ([errno, arr])=>{
                if(useBigint && arr){
                    arr = arr.map(num => BigInt(num))
                    arr = new BigInt64Array(arr);
                }
                req.oncomplete(error(errno), arr)
            })
        }else{
            let [errno, arr] = bindings.fs.fstatSync(fd)
            if(useBigint && arr){
                arr = arr.map(num => BigInt(num))
                arr = new BigInt64Array(arr);
            }
            errorSync(errno)
            return arr
        }
    },
    open(path, flagsNumber, mode, req){
        if(req){
            bindings.fs.open(path, flagsNumber, mode, ([errno, fd])=>{
                req.oncomplete(error(errno), fd);
            })
        }else{
            const [errno, fd] = bindings.fs.openSync(path, flagsNumber, mode);
            errorSync(errno);
            return fd;
        }
    },
    read(fd, buffer, offset, length, position, req){
        buffer = buffer.buffer;
        if(req){
            bindings.fs.read(fd, buffer, offset, length, position, ([errno, bytesRead, buffer])=>{
                req.oncomplete(error(errno), bytesRead, buffer);
            })
        }else{
            const [errno, bytesRead, _] = bindings.fs.readSync(fd, buffer, offset, length, position);
            errorSync(errno);
            return bytesRead;
        }
    },
    close(fd, req){
        if(req){
            bindings.fs.close(fd, ([errno, _])=>{
                req.oncomplete(error(errno), _);
            })
        }else{
            const [errno, _] = bindings.fs.closeSync(fd);
            errorSync(errno);
            return _;
        }
    }
}