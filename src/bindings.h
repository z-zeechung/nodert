#ifndef QUICKJS_BINDINGS_H
#define QUICKJS_BINDINGS_H

#include <quickjs.h>

#ifdef __cplusplus
extern "C" {
#endif

JSModuleDef *js_init_binding_os(JSContext *ctx, const char *module_name);
JSModuleDef *js_init_binding_constants(JSContext *ctx, const char *module_name);
JSModuleDef *js_init_binding_util(JSContext *ctx, const char *module_name);

#ifdef __cplusplus
} /* extern "C" */
#endif

#endif /* QUICKJS_BINDINGS_H */