
const {
    validateString,
    validateInteger
} = require('internal/validators');

const {
    resolve
} = require('path');

class FSReqCallback {
    oncomplete(...args) {}
}

function readBuffersAsync(fd, buffers, position, req) {
    const totalBuffers = buffers.length;
    let totalBytesRead = 0;
    let index = 0;

    function readNext() {
        if (index >= totalBuffers) {
            return req.oncomplete(undefined, totalBytesRead);
        }

        const buffer = buffers[index];
        const length = buffer.byteLength;
        const currentPosition = position === null ? null : position + totalBytesRead;

        bindings.fs.read(fd, buffer, 0, length, currentPosition, (err, bytesRead, buf) => {
            if (err) {
                return req.oncomplete(err);
            }

            totalBytesRead += bytesRead;
            index++;

            if (bytesRead === 0 || bytesRead < length || index >= totalBuffers) {
                // EOF
                req.oncomplete(null, totalBytesRead);
            } else {
                readNext();
            }
        });
    }

    if (buffers.length === 0) {
        process.nextTick(() => req.oncomplete(undefined, 0));
    } else {
        readNext();
    }
}

function readBuffersSync(fd, buffers, position) {
    let totalBytesRead = 0;

    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        const length = buffer.byteLength;
        const currentPosition = position === null ? null : position + totalBytesRead;

        const bytesRead = bindings.fs.readSync(fd, buffer, 0, length, currentPosition);

        totalBytesRead += bytesRead;

        if (bytesRead === 0 || bytesRead < length) {
            break; // EOF
        }
    }

    return totalBytesRead;
}

function writeBuffersAsync(fd, buffers, position, req) {
    const totalBuffers = buffers.length;
    let totalBytesWritten = 0;
    let index = 0;

    function writeNext() {
        if (index >= totalBuffers) {
            return req.oncomplete(undefined, totalBytesWritten);
        }

        const buffer = buffers[index];
        const length = buffer.byteLength;
        const currentPosition = position === null ? null : position + totalBytesWritten;

        bindings.fs.write(fd, buffer, 0, length, currentPosition, (err, bytesWritten) => {
            if (err) {
                return req.oncomplete(err);
            }

            totalBytesWritten += bytesWritten;
            index++;

            if(bytesWritten < length || index >= totalBuffers){
                req.oncomplete(undefined, totalBytesWritten);
            }else{
                writeNext();
            }
        })
    }

    if(buffers.length === 0){
        process.nextTick(() => req.oncomplete(undefined, 0));
    } else {
        writeNext();
    }
}

function writeBuffersSync(fd, buffers, position) {
    let totalBytesWritten = 0;

    for (let i = 0; i < buffers.length; i++) {
        const buffer = buffers[i];
        const length = buffer.byteLength;
        const currentPosition = position === null ? null : position + totalBytesWritten;

        const bytesWritten = bindings.fs.writeSync(fd, buffer, 0, length, currentPosition);

        totalBytesWritten += bytesWritten;

        if (bytesWritten === 0 || bytesWritten < length) {
            break; // EOF
        }
    }
}

module.exports = {

    statValues: [], // STUB

    FSReqCallback,
    
    access: (path, mode, req)=>{
        path = resolve(path);
        validateInteger(mode, 'mode');
        if(req){
            bindings.fs.access(path, mode, (err, _)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.accessSync(path, mode)
        }
    },
    existsSync: (path)=>{
        path = resolve(path);
        return bindings.fs.existsSync(path)
    },
    open: (path, flags, mode, req)=>{
        path = resolve(path);
        if(req){
            bindings.fs.open(path, flags, mode, (err, fd)=>{
                req.oncomplete(err, fd)
            })
        }else{
            return bindings.fs.openSync(path, flags, mode)
        }
    },
    readFileUtf8(path, flags){
        const fd = bindings.fs.openSync(path, flags, 0o666);
        try {
            const chunks = []; 
            let bytesRead;     
            let total = 0;     

            while (true) {
                const buffer = Buffer.allocUnsafe(8192); 
                bytesRead = bindings.fs.readSync(fd, buffer, 0, 8192, null);
                if (bytesRead === 0) break; 

                if (bytesRead < buffer.length) {
                    chunks.push(buffer.subarray(0, bytesRead));
                } else {
                    chunks.push(buffer);
                }
                total += bytesRead;
            }

            const result = Buffer.concat(chunks, total).toString('utf8');
            return result;
        } finally {
            bindings.fs.closeSync(fd); 
        }
    },
    close(fd, req){
        if(req){
            bindings.fs.close(fd, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.closeSync(fd)
        }
    },
    read(fd, buffer, offset, length, position, req){
        buffer = buffer.buffer
        if(req){
            bindings.fs.read(fd, buffer, offset, length, position, (err, bytesRead)=>{
                req.oncomplete(err, bytesRead, buffer)
            })
        }else{
            return bindings.fs.readSync(fd, buffer, offset, length, position)
        }
    },
    readBuffers(fd, buffers, position, req){
        if (req !== undefined) {
            return readBuffersAsync(fd, buffers, position, req);
        }
        return readBuffersSync(fd, buffers, position);
    },
    writeBuffer(fd, buffer, offset, length, position, req){
        if(req){
            bindings.fs.writeBuffer(fd, buffer, offset, length, position, (err, bytesWritten)=>{
                req.oncomplete(err, bytesWritten)
            })
        }else{
            return bindings.fs.writeBufferSync(fd, buffer, offset, length, position)
        }
    },
    writeString(fd, string, offset, length, req) {
        const isSync = req === undefined;

        const buf = Buffer.from(string, encoding || 'utf8');

        if (isSync) {
            const bytesWritten = binding.fs.writeBufferSync(
                fd,
                buf,
                offset,
                length,
                position
            );
            return bytesWritten;

        } else {
            binding.fs.writeBuffer(
                fd,
                buf,
                offset,
                length,
                position,
                (err, bytesWritten) => {
                    req.oncomplete(err, bytesWritten)
                }
            );
        }
    },
    writeBuffers(fd, buffers, position, req){
        if (req !== undefined) {
            return writeBuffersAsync(fd, buffers, position, req);
        }
        return writeBuffersSync(fd, buffers, position);
    },
    rename(oldPath, newPath, req){
        oldPath = resolve(oldPath)
        newPath = resolve(newPath)
        if(req){
            bindings.fs.rename(oldPath, newPath, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.renameSync(oldPath, newPath)
        }
    },
    ftruncate(fd, length, req){
        if(req){
            bindings.fs.ftruncate(fd, length, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.ftruncateSync(fd, length)
        }
    },
    rmdir(path, req){
        path = resolve(path)
        if(req){
            bindings.fs.rmdir(path, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.rmdirSync(path)
        }
    },
    fdatasync(fd, req){
        if(req){
            bindings.fs.fdatasync(fd, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.fdatasyncSync(fd)
        }
    },
    fsync(fd, req){
        if(req){
            bindings.fs.fsync(fd, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.fsyncSync(fd)
        }
    },
    mkdir(path, mode, recursive, req){
        if(!recursive){
            path = resolve(path)
            if(req){
                bindings.fs.mkdir(path, mode, (err)=>{
                    req.oncomplete(err)
                })
            }else{
                bindings.fs.mkdirSync(path, mode)
            }
            return 
        }
        if(req){
            let firstPath = undefined
            async function amkdirR(path, mode){
                let parent = dirname(path)
                if(!bindings.fs.existsSync(parent)){
                    await amkdirR(parent, mode)
                }else{
                    if(!firstPath){
                        firstPath = path
                    }
                }
                return new Promise((resolve, reject)=>{
                    bindings.fs.mkdir(path, mode, (err)=>{
                        if(err){
                            reject(err)
                        }else{
                            resolve()
                        }
                    })
                })
            }
            path = resolve(path)
            amkdirR(path, mode).then(()=>{
                req.oncomplete()
            }).catch((err)=>{
                req.oncomplete(err)
            })
        }else{
            let firstPath = undefined
            function mkdirR(path, mode){
                let parent = dirname(path)
                if(!bindings.fs.existsSync(parent)){
                    mkdirR(parent, mode)
                }else{
                    firstPath = path
                }
                bindings.fs.mkdirSync(path, mode)
            }
            path = resolve(path)
            mkdirR(path, mode)
            return firstPath
        }
    },
    readdir(path, encoding, withFileTypes, req){

    },
    fstat(fd, useBigint, req){
        if(req){
            bindings.fs.fstat(fd, (err, arr)=>{
                if(useBigint){
                    arr = BigInt64Array.from(arr.map((x)=>BigInt(x)))
                }
                req.oncomplete(err, arr)
            })
        }else{
            let ret = bindings.fs.fstatSync(fd)
            if(useBigint){
                ret = BigInt64Array.from(ret.map((x)=>BigInt(x)))
            }
            return ret
        }
    },
    lstat(path, useBigint, req){
        if(req){
            bindings.fs.lstat(path, (err, arr)=>{
                if(useBigint){
                    arr = BigInt64Array.from(arr.map((x)=>BigInt(x)))
                }
                req.oncomplete(err, arr)
            })
        } else{
            let ret = bindings.fs.lstatSync(path)
            if(useBigint){
                ret = BigInt64Array.from(ret.map((x)=>BigInt(x)))
            }
            return ret
        }
    },
    stat(path, useBigint, req){
        if(req){
            bindings.fs.stat(path, (err, arr)=>{
                if(useBigint){
                    arr = BigInt64Array.from(arr.map((x)=>BigInt(x)))
                }
                req.oncomplete(err, arr)
            })
        } else{
            let ret = bindings.fs.statSync(path)
            if(useBigint){
                ret = BigInt64Array.from(ret.map((x)=>BigInt(x)))
            }
            return ret
        }
    },
    statfs(path, useBigint, req){
        if(req){
            bindings.fs.statfs(path, (err, arr)=>{
                if(useBigint){
                    arr = BigInt64Array.from(arr.map((x)=>BigInt(x)))
                }
                req.oncomplete(err, arr)
            })
        } else{
            let ret = bindings.fs.statfsSync(path)
            if(useBigint){
                ret = BigInt64Array.from(ret.map((x)=>BigInt(x)))
            }
            return ret
        }
    },
    readlink(path, encoding, req) {
        function encode(ret){
            if(encoding === 'buffer'){
                return Buffer.from(ret)
            }else if(encoding === 'utf8'){
                return ret
            }else{
                return Buffer.from(ret).toString(encoding)
            }
        }
        if(req){
            bindings.fs.readlink(path, (err, ret)=>{
                req.oncomplete(err, encode(ret))
            })
        }else{
            let ret = bindings.fs.readlinkSync(path)
            return encode(ret)
        }
    },
    symlink(target, path, type, req){
        target = resolve(target)
        path = resolve(path)
        if(req){
            bindings.fs.symlink(target, path, type, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.symlinkSync(target, path, type)
        }
    },
    link(target, path, req){
        target = resolve(target)
        path = resolve(path)
        if(req){
            bindings.fs.link(target, path, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.linkSync(target, path)
        }
    },
    unlink(path, req){
        path = resolve(path)
        if(req){
            bindings.fs.unlink(path, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.unlinkSync(path)
        }
    },
    fchmod(fd, mode, req){
        if(req){
            bindings.fs.fchmod(fd, mode, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.fchmodSync(fd, mode)
        }
    },
    chmod(path, mode, req){
        path = resolve(path)
        if(req){
            bindings.fs.chmod(path, mode, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.chmodSync(path, mode)
        }
    },
    lchown(path, uid, gid, req){
        path = resolve(path)
        if(req){
            bindings.fs.lchown(path, uid, gid, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.lchownSync(path, uid, gid)
        }
    },
    fchown(fd, uid, gid, req){
        if(req){
            bindings.fs.fchown(fd, uid, gid, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.fchownSync(fd, uid, gid)
        }
    },
    chown(path, uid, gid, req){
        path = resolve(path)
        if(req){
            bindings.fs.chown(path, uid, gid, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.chownSync(path, uid, gid)
        }
    },
    utimes(path, atime, mtime, req){
        path = resolve(path)
        if(req){
            bindings.fs.utimes(path, atime, mtime, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.utimesSync(path, atime, mtime)
        }
    },
    futimes(fd, atime, mtime, req){
        if(req){
            bindings.fs.futimes(fd, atime, mtime, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.futimesSync(fd, atime, mtime)
        }
    },
    lutimes(path, atime, mtime, req){
        path = resolve(path)
        if(req){
            bindings.fs.lutimes(path, atime, mtime, (err)=>{
                req.oncomplete(err)
            })
        }else{
            bindings.fs.lutimesSync(path, atime, mtime)
        }
    },
    writeFileUtf8(path, data, flags, mode){
        let fd = binding.fs.openSync(path, flags, mode);
        const buffer = Buffer.from(data, 'utf8');
        const length = buffer.length;
        let offset = 0;
        while (offset < length) {
            const bytesWritten = binding.fs.writeBufferSync(
                fd,
                buffer,
                offset,
                length - offset,
                -1
            );
            offset += bytesWritten;
        }
        binding.fs.closeSync(fd);
    },
}