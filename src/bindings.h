#ifndef QUICKJS_BINDINGS_H
#define QUICKJS_BINDINGS_H

#include <quickjs.h>
#include <quickjs-libc.h>
// #include <uv.h>
#include "global.h"

#ifdef __cplusplus
extern "C" {
#endif

JSModuleDef *js_init_bindings(JSContext *ctx, const char *module_name);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* QUICKJS_BINDINGS_H */