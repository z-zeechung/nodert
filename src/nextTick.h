#ifndef NODERT_NEXT_TICK_H
#define NODERT_NEXT_TICK_H

#include <quickjs.h>
#include <quickjs-libc.h>
#include <stdbool.h>   

#ifdef __cplusplus
extern "C" {
#endif

extern bool hasPendingNextTickJob;

void freeNextTickJobQueue(JSContext *ctx);

void executeNextTickJobs(JSContext *ctx);

JSModuleDef *js_init_nextTick(JSContext *ctx, const char *module_name);

#ifdef __cplusplus
}
#endif

#endif //NODERT_NEXT_TICK_H