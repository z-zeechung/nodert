#include "bindings.h"

#define countof(arr) (sizeof(arr) / sizeof(*arr))

static JSValue getPromiseState(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    
    JSPromiseStateEnum state = JS_PromiseState(ctx, argv[0]);

    switch(state){
        case JS_PROMISE_PENDING: return JS_NewInt32(ctx, 0);
        case JS_PROMISE_FULFILLED: return JS_NewInt32(ctx, 1);
        case JS_PROMISE_REJECTED: return JS_NewInt32(ctx, 2);
    }
}

static JSValue getPromiseResult(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    JSPromiseStateEnum state = JS_PromiseState(ctx, argv[0]);

    if(state==JS_PROMISE_PENDING){
        return JS_UNDEFINED;
    }

    JSValue result = JS_PromiseResult(ctx, argv[0]);
    return JS_DupValue(ctx, result);
}

static const JSCFunctionListEntry util_funcs[] = {
    JS_CFUNC_DEF("getPromiseState", 0, getPromiseState)
};

static int util_module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, util_funcs, countof(util_funcs));
}

JSModuleDef *js_init_binding_util(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, util_module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, util_funcs, countof(util_funcs));
    
    return m;
}