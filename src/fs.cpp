
#include "fs.h"
#include <uvw.hpp>
#include <unordered_map>
#include <sys/stat.h>

typedef struct {
    std::shared_ptr<uvw::file_req> req;
    char* buffer;
    JSValue cb;   // always free this after call
    bool opened;
} FileReqHandle;

std::unordered_map<uintptr_t, FileReqHandle> fileReqHandles;
#define PTR_ADDR(ptr) (reinterpret_cast<uintptr_t>(ptr.get()))

// open: (path: string, flags: number, mode: number, cb: (err?: number, fd?: number) => void) => void
static JSValue fs_open(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {

    const char* path = JS_ToCString(ctx, argv[0]);
    int flags; JS_ToInt32(ctx, &flags, argv[1]);
    int mode; JS_ToInt32(ctx, &mode, argv[2]);
    JSValue cb = JS_DupValue(ctx, argv[3]);

    auto loop = uvw::loop::get_default();
    auto fr = loop->resource<uvw::file_req>();

    fr->on<uvw::fs_event>([ctx, fr](const uvw::fs_event& event, uvw::file_req& req) {
        if(fileReqHandles.find(PTR_ADDR(fr)) == fileReqHandles.end()){
            return;
        }
        FileReqHandle handle = fileReqHandles[PTR_ADDR(fr)];
        if(event.type == uvw::fs_event::fs_type::OPEN){
            JSValue fd[] = {JS_UNDEFINED, JS_NewInt64(ctx, PTR_ADDR(fr))};    // seems that we should manage fd ourselves 😅
            JS_Call(ctx, handle.cb, JS_UNDEFINED, 2, fd);
            JS_FreeValue(ctx, fd[1]);
            JS_FreeValue(ctx, handle.cb);
            handle.opened = true;
        }else if(event.type == uvw::fs_event::fs_type::CLOSE){
            JSValue undefined = JS_UNDEFINED;
            JS_Call(ctx, handle.cb, JS_UNDEFINED, 1, &undefined);
            JS_FreeValue(ctx, handle.cb);
            fileReqHandles.erase(PTR_ADDR(fr));
        }
    });

    fr->on<uvw::error_event>([ctx, fr](const uvw::error_event& event, uvw::file_req& req) {
        FileReqHandle handle = fileReqHandles[PTR_ADDR(fr)];
        JSValue err = JS_NewInt64(ctx, event.code());
        JS_Call(ctx, handle.cb, JS_UNDEFINED, 1, &err);
        JS_FreeValue(ctx, err);
        JS_FreeValue(ctx, handle.cb);
        if(!handle.opened){
            fileReqHandles.erase(PTR_ADDR(fr));
            fr->close();
        }
    });

    fileReqHandles.insert({ PTR_ADDR(fr), {fr, nullptr, JS_UNDEFINED, false} });

    fileReqHandles[PTR_ADDR(fr)].cb = cb;

    fr->open(path, uvw::file_req::file_open_flags{flags}, mode);

    JS_FreeCString(ctx, path);

    return JS_UNDEFINED;
}

// close
static JSValue fs_close(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int64_t fd; JS_ToInt64(ctx, &fd, argv[0]);
    JSValue cb = JS_DupValue(ctx, argv[1]);

    if(fileReqHandles.find(fd) == fileReqHandles.end()){
        JSValue err = JS_NewInt64(ctx, UV_EBADF);
        JS_Call(ctx, cb, JS_UNDEFINED, 1, &err);
        JS_FreeValue(ctx, err);
        JS_FreeValue(ctx, cb);
        return JS_UNDEFINED;
    }

    auto fr = fileReqHandles[fd].req;
    fileReqHandles[fd].cb = cb;
    fr->close();

    return JS_UNDEFINED;
}

static JSValue fs_constants(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {

    #ifdef _WIN32
    # ifndef S_IRUSR
    #  define S_IRUSR _S_IREAD
    # endif
    # ifndef S_IWUSR
    #  define S_IWUSR _S_IWRITE
    # endif
    #endif

    JSValue constants = JS_NewObject(ctx);

    #define SET(name) JS_SetPropertyStr(ctx, constants, #name, JS_NewInt64(ctx, UV_FS_##name))
    SET(O_RDONLY);SET(O_WRONLY);SET(O_RDWR);SET(O_CREAT);SET(O_EXCL);SET(O_TRUNC);SET(O_APPEND);
    #define SET(name) JS_SetPropertyStr(ctx, constants, #name, JS_NewInt64(ctx, name))
    SET(S_IFMT);SET(S_IFREG);SET(S_IFDIR);SET(S_IFCHR);SET(S_IFIFO);SET(S_IFLNK);SET(S_IRUSR);SET(S_IWUSR);
    SET(F_OK);SET(R_OK);SET(W_OK);SET(X_OK);
    SET(UV_DIRENT_UNKNOWN);SET(UV_DIRENT_FILE);SET(UV_DIRENT_DIR);SET(UV_DIRENT_LINK);SET(UV_DIRENT_FIFO);SET(UV_DIRENT_SOCKET);SET(UV_DIRENT_CHAR);SET(UV_DIRENT_BLOCK);
    SET(UV_FS_SYMLINK_DIR);SET(UV_FS_SYMLINK_JUNCTION);
    SET(UV_FS_O_FILEMAP);
    SET(UV_FS_COPYFILE_EXCL);SET(UV_FS_COPYFILE_FICLONE);SET(UV_FS_COPYFILE_FICLONE_FORCE);
    #define SET(name) JS_SetPropertyStr(ctx, constants, #name, JS_NewInt64(ctx, UV_FS_##name))
    SET(COPYFILE_EXCL);SET(COPYFILE_FICLONE);SET(COPYFILE_FICLONE_FORCE);
    #undef SET

    return constants;
}


static int bindings_module_init(JSContext *ctx, JSModuleDef *m) {

    JS_SetModuleExport(ctx, m, "open", JS_NewCFunction(ctx, fs_open, "open", 0));
    JS_SetModuleExport(ctx, m, "close", JS_NewCFunction(ctx, fs_close, "close", 0));

    JS_SetModuleExport(ctx, m, "constants", JS_NewCFunction(ctx, fs_constants, "constants", 0));

    return 0;
}

extern "C" {
    JSModuleDef *js_init_fs_bindings(JSContext *ctx, const char *module_name) {
        JSModuleDef *m = JS_NewCModule(ctx, module_name, bindings_module_init);
        if (!m) return NULL;
        
        JS_AddModuleExport(ctx, m, "open");
        JS_AddModuleExport(ctx, m, "close");
        JS_AddModuleExport(ctx, m, "constants");
        
        return m;
    }
}