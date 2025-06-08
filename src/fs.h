#ifndef NODERT_FS_BINDINGS_H
#define NODERT_FS_BINDINGS_H

#include <quickjs.h>
#include <quickjs-libc.h>

#ifdef __cplusplus
extern "C" {
#endif

JSModuleDef *js_init_fs_bindings(JSContext *ctx, const char *module_name);

#ifdef __cplusplus
}
#endif


#endif //NODERT_FS_BINDINGS_H