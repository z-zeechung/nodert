#ifndef NODERT_FS_H
#define NODERT_FS_H

#include <quickjs.h>

#ifdef _WIN32
    #include <fcntl.h>

    #define O_RDONLY   _O_RDONLY
    #define O_WRONLY   _O_WRONLY
    #define O_RDWR     _O_RDWR
    #define O_CREAT    _O_CREAT
    #define O_EXCL     _O_EXCL
    #define O_TRUNC    _O_TRUNC
    #define O_APPEND   _O_APPEND

    #define S_IFMT     _S_IFMT
    #define S_IFREG    _S_IFREG
    #define S_IFDIR    _S_IFDIR
    #define S_IFCHR    _S_IFCHR
    #define S_IFIFO    _S_IFIFO
    #define S_IFLNK    0xA000
    #define S_IRUSR    _S_IREAD
    #define S_IWUSR    _S_IWRITE

    #define F_OK 0  // aligned with `_access` mode flags in msvc <io.h>
    #define R_OK 4
    #define W_OK 2
    #define X_OK 1
#endif

#ifdef __cplusplus
extern "C"{
#endif

JSModuleDef *js_init_fs_bindings(JSContext *ctx, const char *module_name);

#ifdef __cplusplus
}
#endif

#endif // NODERT_FS_H