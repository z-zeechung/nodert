#include <stdio.h>
#include <quickjs.h>
#include <quickjs-libc.h>
#include "bindings.h"

void print_js_error(JSContext *ctx, JSValue error) {
    const char *str = JS_ToCString(ctx, error);
    
    JSValue stack_val = JS_GetPropertyStr(ctx, error, "stack");
    const char *stack = JS_IsUndefined(stack_val) ? NULL : JS_ToCString(ctx, stack_val);
    
    if (stack) {
        fprintf(stderr, "Error: %s\nStack: %s\n", str, stack);
        JS_FreeCString(ctx, stack);
    } else {
        fprintf(stderr, "Error: %s\n", str);
    }
    
    JS_FreeCString(ctx, str);
    JS_FreeValue(ctx, stack_val);
}

int main(int argc, char *argv[]) {
    JSRuntime *rt = JS_NewRuntime();
    JS_SetHostPromiseRejectionTracker(rt, js_std_promise_rejection_tracker, NULL);
    JSContext *ctx = JS_NewContext(rt);

    js_std_add_helpers(ctx, argc, argv);
    js_std_init_handlers(rt);

    js_init_module_std(ctx, "qjs:std");
    js_init_module_os(ctx, "qjs:os");
    // js_init_module_bjson(ctx, "qjs:bjson");

    js_init_binding_os(ctx, "os");
    js_init_binding_constants(ctx, "constants");

    FILE *file = fopen("lib/main.js", "r");
    char script[1024*32];
    fread(script, 1, sizeof(script), file);
    fclose(file);

    JSValue result = JS_Eval(ctx, script, strlen(script), "<internal>", JS_EVAL_TYPE_GLOBAL | JS_EVAL_FLAG_ASYNC | JS_EVAL_TYPE_MODULE);

    int ret = 0;
    if (JS_IsException(result)) {
        JSValue exception = JS_GetException(ctx);
        print_js_error(ctx, exception);
        JS_FreeValue(ctx, exception);
        ret = -1;
    } else {
        js_std_loop(ctx);
        
        JSValue global_obj = JS_GetGlobalObject(ctx);
        JSValue promise = JS_GetPropertyStr(ctx, global_obj, "Promise");
        if (JS_IsException(promise)) {
            JSValue exception = JS_GetException(ctx);
            print_js_error(ctx, exception);
            JS_FreeValue(ctx, exception);
            ret = -1;
        }
        JS_FreeValue(ctx, promise);
        JS_FreeValue(ctx, global_obj);
    }

    JS_FreeValue(ctx, result);
    js_std_free_handlers(rt);
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);

    return ret;
}