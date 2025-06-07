#ifndef NODERT_TIMERS_H
#define NODERT_TIMERS_H

#include <quickjs.h>
#include <quickjs-libc.h>
#include <uv.h>

#ifdef __cplusplus
extern "C" {
#endif

JSModuleDef *js_init_timers_bindings(JSContext *ctx, const char *module_name);

#ifdef __cplusplus
}
#endif

#endif //NODERT_TIMERS_H