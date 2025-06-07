#include <nextTick.h>

bool hasPendingNextTickJob = false;
static JSValue queue;   // will be init as JS_UNDEFINED in js_init_nextTick

static void initNextTickJobQueue(JSContext *ctx) {
    if (JS_IsUndefined(queue)) {
        queue = JS_NewArray(ctx);
    }
}

void freeNextTickJobQueue(JSContext *ctx) {
    if (!JS_IsUndefined(queue)) {
        JS_FreeValue(ctx, queue);
        queue = JS_UNDEFINED;
    }
}

void executeNextTickJobs(JSContext *ctx) {
    if (JS_IsUndefined(queue)) return;

    hasPendingNextTickJob = false;
    
    int64_t len; JS_GetLength(ctx, queue, &len);
    if (len < 0) {
        return;
    }
    
    if (len == 0) return;  // Early exit if no jobs
    
    JSValue* jobs = (JSValue*)malloc(sizeof(JSValue) * len);
    if (!jobs) return;
    
    // Collect jobs
    for(int i = 0; i < len; i++) {
        jobs[i] = JS_GetPropertyUint32(ctx, queue, i);
        if (JS_IsException(jobs[i])) {
            // Free all collected jobs and the array
            for (int j = 0; j < i; j++) {
                JS_FreeValue(ctx, jobs[j]);
            }
            free(jobs);  // release array
            return;
        }
    }
    
    // Reset queue
    JS_SetPropertyUint32(ctx, queue, "length", JS_NewInt32(ctx, 0));
    
    JSValue globalObject = JS_GetGlobalObject(ctx);
    
    // Execute jobs
    for(int i = 0; i < len; i++) {
        JSValue ret = JS_Call(ctx, jobs[i], globalObject, 0, NULL);
        if (JS_IsException(ret)) {
            JS_FreeValue(ctx, ret);  // Free exception
        }
        JS_FreeValue(ctx, ret);
        JS_FreeValue(ctx, jobs[i]);
    }
    
    JS_FreeValue(ctx, globalObject);
    free(jobs);
}

static JSValue nextTick(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (JS_IsUndefined(queue)) {
        initNextTickJobQueue(ctx);
    }
    
    hasPendingNextTickJob = true;
    JSValue cb = JS_DupValue(ctx, argv[0]); // Take ownership
    int64_t len; JS_GetLength(ctx, queue, &len);
    JS_SetPropertyUint32(ctx, queue, len, cb);
    return JS_UNDEFINED;
}


#define countof(arr) (sizeof(arr) / sizeof(*arr))

static const JSCFunctionListEntry funcs[] = {
    JS_CFUNC_DEF("nextTick", 1, nextTick),
};

static int module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, funcs, countof(funcs));
}

JSModuleDef *js_init_nextTick(JSContext *ctx, const char *module_name) {

    queue = JS_UNDEFINED;

    JSModuleDef *m = JS_NewCModule(ctx, module_name, module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, funcs, countof(funcs));
    
    return m;
}