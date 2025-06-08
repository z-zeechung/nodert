

function open_validate(args){
    let path, flags, mode, cb;
    if(args.length<2){
        throw new Error('open() requires at least 2 arguments');
    }else if(args.length==2){
        [path, cb] = args;
    }else if(args.length==3){
        [path, flags, cb] = args;
    }else{
        [path, flags, mode, cb] = args;
    }
    if(flags===undefined){ 
        flags = 'r';
    }
    if(mode===undefined){
        mode = 0o666;
    }
    if(typeof path !== 'string'){
        throw new TypeError('path must be a string');
    }
    if(typeof flags !== 'string'){
        throw new TypeError('flags must be a string');
    }else{
        const c = bindings.fs.constants
        switch (flags){
            case 'a': flags = c.O_APPEND; break;
            case 'ax': flags = c.O_APPEND | c.O_EXCL; break;
            case 'a+': flags = c.O_APPEND | c.O_RDWR; break;
            case 'ax+': flags = c.O_APPEND | c.O_EXCL | c.O_RDWR; break;
            case 'as': flags = c.O_APPEND | c.O_SYNC; break;
            case 'as+': flags = c.O_APPEND | c.O_SYNC | c.O_RDWR; break;
            case 'r': flags = c.O_RDONLY; break;
            case 'rs': flags = c.O_RDONLY | c.O_SYNC; break;
            case 'r+': flags = c.O_RDWR; break;
            case 'rs+': flags = c.O_RDWR | c.O_SYNC; break;
            case 'w': flags = c.O_WRONLY; break;
            case 'wx': flags = c.O_WRONLY | c.O_EXCL; break;
            case 'w+': flags = c.O_RDWR; break;
            case 'wx+': flags = c.O_RDWR | c.O_EXCL; break;
            default: throw new Error('Unknown flags');
        }
    }
    if(typeof mode !== 'number'){
        if(typeof mode !== 'string'){
            throw new Error('Unknown mode');
        }
        mode = parseInt(mode, 8);
    }
    if(typeof cb !== 'function'){
        throw new Error('callback must be a function');
    }
    return {path, flags, mode, cb};
}
function open(...args){
    let {path, flags, mode, cb} = open_validate(args);
    bindings.fs.open(
        path, flags, mode,
        (errno, fd)=>{
            const err = errno ? new Error(`ERRNO [${errno}]`) : undefined;
            cb(err, fd);
        }
    )
}

function close_validate(fd, cb){
    if(typeof fd !== 'number'){
        throw new Error('invalid fd');
    }
    if(cb !== undefined && typeof cb !== 'function'){
        throw new Error('callback must be a function');
    }
    return {fd, cb};
}
function close(fd, cb){
    let {fd: _fd, cb: _cb} = close_validate(fd, cb);
    bindings.fs.close(_fd, (errno)=>{
        const err = errno ? new Error(`ERRNO [${errno}]`) : undefined;
        _cb(err);
    });
}


module.exports = {
    open,
    close,
}