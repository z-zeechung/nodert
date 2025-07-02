
#include <fs.h>
#include <event_queue.h>

#include <io.h>
#include <windows.h>
static wchar_t* utf8_to_wchar(const char* utf8) {
    if (!utf8) return NULL;

    int size = MultiByteToWideChar(CP_UTF8, 0, utf8, -1, NULL, 0);
    if (size == 0) return NULL;

    wchar_t* wstr = (wchar_t*)malloc(size * sizeof(wchar_t));
    if (!wstr) return NULL;

    if (MultiByteToWideChar(CP_UTF8, 0, utf8, -1, wstr, size) == 0) {
        free(wstr);
        return NULL;
    }

    return wstr;
}
#include <errno.h>
#include <stdbool.h>
#include <direct.h>
#include <shlobj.h>
#include <win_errno.h>
#include <sys/stat.h>
#include <math.h>

#define MAX(a,b) (((a) > (b)) ? (a) : (b))
#define MIN(a,b) (((a) < (b)) ? (a) : (b))

#define FS_RETURN(errnum, data) do {JSValue _ret = JS_NewArray(ctx); JS_SetPropertyUint32(ctx, _ret, 0, JS_NewInt32(ctx, (errnum))); JS_SetPropertyUint32(ctx, _ret, 1, (data)); return _ret;} while(0)


static JSValue js_accessSync(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    char* path = JS_ToCString(ctx, argv[0]);
    int mode; JS_ToInt32(ctx, &mode, argv[1]);

    wchar_t* wp = utf8_to_wchar(path);
    JS_FreeCString(ctx, path);
    if(!wp) FS_RETURN(ENOMEM, JS_UNDEFINED);

    int ret = _waccess(wp, mode);
    free(wp);

    if(ret<0) FS_RETURN(errno, JS_UNDEFINED);

    FS_RETURN(0, JS_UNDEFINED);
}

static JSValue js_renameSync(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    char* oldpath = JS_ToCString(ctx, argv[0]);
    char* newpath = JS_ToCString(ctx, argv[1]);

    wchar_t* woldpath = utf8_to_wchar(oldpath);
    wchar_t* wnewpath = utf8_to_wchar(newpath);

    if(!woldpath || !wnewpath) FS_RETURN(ENOMEM, JS_UNDEFINED);

    int ret = _wrename(woldpath, wnewpath);

    free(woldpath);
    free(wnewpath);
    JS_FreeCString(ctx, oldpath);
    JS_FreeCString(ctx, newpath);

    if(ret<0) FS_RETURN(errno, JS_UNDEFINED);

    FS_RETURN(0, JS_UNDEFINED);
}

static JSValue js_rmdirSync(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    char* path = JS_ToCString(ctx, argv[0]);

    wchar_t* wp = utf8_to_wchar(path);
    JS_FreeCString(ctx, path);

    if(!wp) FS_RETURN(ENOMEM, JS_UNDEFINED);

    int ret = _wrmdir(wp);
    free(wp);

    if(ret<0) FS_RETURN(errno, JS_UNDEFINED);

    FS_RETURN(0, JS_UNDEFINED);
}

static JSValue js_mkdirSync(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    char* path = JS_ToCString(ctx, argv[0]);
    int mode; JS_ToInt32(ctx, &mode, argv[1]);
    bool recursive = JS_ToBool(ctx, argv[2]);

    wchar_t* wp = utf8_to_wchar(path);
    JS_FreeCString(ctx, path);

    if(!wp) FS_RETURN(ENOMEM, JS_UNDEFINED);

    if(recursive){
        wchar_t fullPath[MAX_PATH];
        int ret = GetFullPathNameW(wp, MAX_PATH, fullPath, NULL);
        free(wp);
        if(!ret){
            int err = win_errno_to_posix_errno(GetLastError(), EIO);
            FS_RETURN(err, JS_UNDEFINED);
        }
        ret = SHCreateDirectoryExW(NULL, fullPath, NULL);
        if(!ret){
            int err = win_errno_to_posix_errno(GetLastError(), EIO);
            FS_RETURN(err, JS_UNDEFINED);
        }
        FS_RETURN(0, JS_UNDEFINED);
    }

    int ret = _wmkdir(wp);
    free(wp);

    if(ret<0) FS_RETURN(errno, JS_UNDEFINED);

    FS_RETURN(0, JS_UNDEFINED);
}

static DWORD js_fstatSync_blksize(int fd) {

    DWORD retval = 0;

    HANDLE hFile = (HANDLE)_get_osfhandle(fd);
    if (hFile == INVALID_HANDLE_VALUE) {
        goto ret;
    }
    
    char filePath[MAX_PATH];
    if (!GetFinalPathNameByHandleA(hFile, filePath, MAX_PATH, VOLUME_NAME_DOS)) {
        goto ret;
    }
    char drive[4] = { filePath[0], filePath[1], filePath[2], '\0' };

    if(!(drive[0]>='A'&&drive[0]<='z'&&drive[1]==':'&&(drive[2]=='\\'||drive[2]=='/'))){
        retval = 4096;
        goto ret;
    }

    DWORD sectorsPerCluster, bytesPerSector;
    DWORD freeClusters, totalClusters;
    if (!GetDiskFreeSpaceA(
        drive,                 
        &sectorsPerCluster,
        &bytesPerSector, 
        &freeClusters,
        &totalClusters)) {
        goto ret;
    }

    retval = bytesPerSector;

ret:
    return retval;
}
static const int64_t WINDOWS_TICK = 10000000;
static const int64_t SEC_TO_UNIX_EPOCH = 11644473600LL;
static int64_t js_fstatSync_time_sec(FILETIME ft) {
    ULARGE_INTEGER uli;
    uli.LowPart = ft.dwLowDateTime;
    uli.HighPart = ft.dwHighDateTime;
    // Convert to seconds since Windows epoch, then subtract Unix epoch offset
    return uli.QuadPart / WINDOWS_TICK - SEC_TO_UNIX_EPOCH;
}
static int32_t js_fstatSync_time_nsec(FILETIME ft) {
    ULARGE_INTEGER uli;
    uli.LowPart = ft.dwLowDateTime;
    uli.HighPart = ft.dwHighDateTime;
    // Get the remaining 100-ns units after whole seconds
    int64_t remaining = uli.QuadPart % WINDOWS_TICK;
    // Convert to nanoseconds (multiply by 100)
    return (int32_t)(remaining * 100);
}
static bool js_fstatSync_time(int fd,
    int64_t* atime_sec, int64_t* mtime_sec, int64_t* ctime_sec, int64_t* birthtime_sec,
    int64_t* atime_nsec, int64_t* mtime_nsec, int64_t* ctime_nsec, int64_t* birthtime_nsec
){
    bool ret = true;

    HANDLE hFile = (HANDLE)_get_osfhandle(fd);
    if (hFile == INVALID_HANDLE_VALUE) {
        ret = false;
        goto ret;
    }

    FILETIME ftCreate, ftAccess, ftModify;
    if(!GetFileTime(hFile, &ftCreate, &ftAccess, &ftModify)) {
        ret = false;
        goto ret;
    }

    if(atime_sec) *atime_sec = js_fstatSync_time_sec(ftAccess);
    if(mtime_sec) *mtime_sec = js_fstatSync_time_sec(ftModify);
    if(ctime_sec) *ctime_sec = js_fstatSync_time_sec(ftModify);
    if(birthtime_sec) *birthtime_sec = js_fstatSync_time_sec(ftCreate);

    if(atime_nsec) *atime_nsec = js_fstatSync_time_nsec(ftAccess);
    if(mtime_nsec) *mtime_nsec = js_fstatSync_time_nsec(ftModify);
    if(ctime_nsec) *ctime_nsec = js_fstatSync_time_nsec(ftModify);
    if(birthtime_nsec) *birthtime_nsec = js_fstatSync_time_nsec(ftCreate);

ret:
    return ret;
}
static JSValue js_fstatSync(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    int fd; JS_ToInt32(ctx, &fd, argv[0]);

    JSValue ret = JS_UNDEFINED;
    int errnum = 0;

    struct _stat64 st;
    if (_fstat64(fd, &st)<0) {
        errnum = errno;
        goto retval;
    }

    int64_t blksize = js_fstatSync_blksize(fd);
    if(!blksize) {
        errnum = win_errno_to_posix_errno(GetLastError(), EIO);
        goto retval;
    }

    int64_t atime_sec, mtime_sec, ctime_sec, birthtime_sec;
    int64_t atime_nsec, mtime_nsec, ctime_nsec, birthtime_nsec;
    if(!js_fstatSync_time(fd,
        &atime_sec, &mtime_sec, &ctime_sec, &birthtime_sec,
        &atime_nsec, &mtime_nsec, &ctime_nsec, &birthtime_nsec
    )) {
        errnum = win_errno_to_posix_errno(GetLastError(), EIO);
        goto retval;
    }

    int64_t dev = st.st_dev;
    int64_t ino = st.st_ino;
    int64_t mode = st.st_mode;
    int64_t nlink = st.st_nlink;
    int64_t uid = st.st_uid;
    int64_t gid = st.st_gid;
    int64_t rdev = st.st_rdev;
    int64_t size = st.st_size;
    int64_t blocks = (unsigned long)ceil((double)st.st_size / blksize);

    ret = JS_NewArray(ctx);
    JS_SetPropertyUint32(ctx, ret, 0, JS_NewInt64(ctx, dev));
    JS_SetPropertyUint32(ctx, ret, 1, JS_NewInt64(ctx, mode));
    JS_SetPropertyUint32(ctx, ret, 2, JS_NewInt64(ctx, nlink));
    JS_SetPropertyUint32(ctx, ret, 3, JS_NewInt64(ctx, uid));
    JS_SetPropertyUint32(ctx, ret, 4, JS_NewInt64(ctx, gid));
    JS_SetPropertyUint32(ctx, ret, 5, JS_NewInt64(ctx, rdev));
    JS_SetPropertyUint32(ctx, ret, 6, JS_NewInt64(ctx, blksize));
    JS_SetPropertyUint32(ctx, ret, 7, JS_NewInt64(ctx, ino));
    JS_SetPropertyUint32(ctx, ret, 8, JS_NewInt64(ctx, size));
    JS_SetPropertyUint32(ctx, ret, 9, JS_NewInt64(ctx, blocks));
    JS_SetPropertyUint32(ctx, ret, 10, JS_NewInt64(ctx, atime_sec));
    JS_SetPropertyUint32(ctx, ret, 11, JS_NewInt64(ctx, atime_nsec));
    JS_SetPropertyUint32(ctx, ret, 12, JS_NewInt64(ctx, mtime_sec));
    JS_SetPropertyUint32(ctx, ret, 13, JS_NewInt64(ctx, mtime_nsec));
    JS_SetPropertyUint32(ctx, ret, 14, JS_NewInt64(ctx, ctime_sec));
    JS_SetPropertyUint32(ctx, ret, 15, JS_NewInt64(ctx, ctime_nsec));
    JS_SetPropertyUint32(ctx, ret, 16, JS_NewInt64(ctx, birthtime_sec));
    JS_SetPropertyUint32(ctx, ret, 17, JS_NewInt64(ctx, birthtime_nsec));

retval:
    FS_RETURN(errnum, ret);
}

static JSValue js_openSync(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    char* path = JS_ToCString(ctx, argv[0]);
    int flag; JS_ToInt32(ctx, &flag, argv[1]);
    int mode; JS_ToInt32(ctx, &mode, argv[2]);

    wchar_t* wpath = utf8_to_wchar(path);
    JS_FreeCString(ctx, path);
    if(!wpath){
        FS_RETURN(ENOMEM, JS_UNDEFINED);
    }

    int fd = _wopen(wpath, flag, mode);

    free(wpath);

    if(fd<0){
        FS_RETURN(errno, JS_UNDEFINED);
    }

    FS_RETURN(0, JS_NewInt32(ctx, fd));
}

struct js_read_payload{
    JSContext* ctx;
    int fd; JSValue buffer; int64_t offset; int64_t length; int64_t position;
    JSValue req;
    int errnum; int64_t bytes_read;
};
static void js_read_event_callback(void* data){
    struct js_read_payload* payload = (struct js_read_payload*)data;
    JSContext* ctx = payload->ctx;
    JSValue ret = JS_NewArray(ctx);

    if(payload->errnum){
        JS_SetPropertyUint32(ctx, ret, 0, JS_NewInt32(ctx, payload->errnum));
        JS_Call(ctx, payload->req, JS_UNDEFINED, 1, &ret);
        goto cleanup;
    }

    JS_SetPropertyUint32(ctx, ret, 0, JS_NewInt32(ctx, 0));
    JS_SetPropertyUint32(ctx, ret, 1, JS_NewInt32(ctx, payload->bytes_read));
    JS_SetPropertyUint32(ctx, ret, 2, payload->buffer);
    JS_Call(ctx, payload->req, JS_UNDEFINED, 1, &ret);

cleanup:
    JS_FreeValue(ctx, payload->req);
    JS_FreeValue(ctx, payload->buffer);
    free(payload);
}
static void js_read_worker_callback(void* data){
    struct js_read_payload* payload = (struct js_read_payload*)data;
    payload->errnum = 0;
    int64_t size; char* buffer = JS_GetArrayBuffer(
        payload->ctx, &size, payload->buffer);
    if(_lseek(payload->fd, payload->position, SEEK_SET)<0){
        payload->errnum = errno;
        return;
    }
    payload->bytes_read = _read(payload->fd, buffer+payload->offset, MIN(payload->length, MAX(size-payload->offset, 0)));
    if(payload->bytes_read<0){
        payload->errnum = errno;
    }
}
static JSValue js_read(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    struct js_read_payload* payload = malloc(sizeof(struct js_read_payload));
    payload->ctx = ctx;
    JS_ToInt32(ctx, &payload->fd, argv[0]);
    payload->buffer = JS_DupValue(ctx, argv[1]);
    JS_ToInt64(ctx, &payload->offset, argv[2]);
    JS_ToInt64(ctx, &payload->length, argv[3]);
    JS_ToInt64(ctx, &payload->position, argv[4]);
    payload->req = JS_DupValue(ctx, argv[5]);
    push_to_generic_event_queue(js_read_worker_callback, payload, js_read_event_callback);
    return JS_UNDEFINED;
}

static JSValue js_readSyncCb(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    struct js_read_payload* payload = malloc(sizeof(struct js_read_payload));
    payload->ctx = ctx;
    JS_ToInt32(ctx, &payload->fd, argv[0]);
    payload->buffer = JS_DupValue(ctx, argv[1]);
    JS_ToInt64(ctx, &payload->offset, argv[2]);
    JS_ToInt64(ctx, &payload->length, argv[3]);
    JS_ToInt64(ctx, &payload->position, argv[4]);
    payload->req = JS_DupValue(ctx, argv[5]);
    execute_event_sync(js_read_worker_callback, payload, js_read_event_callback);
    return JS_UNDEFINED;
}

static JSValue js_closeSync(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    int fd; JS_ToInt32(ctx, &fd, argv[0]);

    int ret = _close(fd);
    
    if(ret<0){
        FS_RETURN(errno, JS_UNDEFINED);
    }

    FS_RETURN(0, JS_UNDEFINED);
}


#define countof(arr) (sizeof(arr) / sizeof(*arr))

static const JSCFunctionListEntry bindings_funcs[] = {
    JS_CFUNC_DEF("accessSync", 0, js_accessSync),
    JS_CFUNC_DEF("renameSync", 0, js_renameSync),
    JS_CFUNC_DEF("rmdirSync", 0, js_rmdirSync),
    JS_CFUNC_DEF("mkdirSync", 0, js_mkdirSync),
    JS_CFUNC_DEF("fstatSync", 0, js_fstatSync),
    JS_CFUNC_DEF("openSync", 0, js_openSync),
    JS_CFUNC_DEF("read", 0, js_read),
    JS_CFUNC_DEF("readSyncCb", 0, js_readSyncCb),
    JS_CFUNC_DEF("closeSync", 0, js_closeSync),
};

static int bindings_module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
}

JSModuleDef *js_init_fs_bindings(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, bindings_module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
    
    return m;
}