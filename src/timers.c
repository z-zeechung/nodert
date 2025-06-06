
#include "timers.h"

typedef struct {
    JSContext *ctx;
    JSValue callback;
    uv_timer_t timer;
    int is_interval;
    int64_t timeout_id;
} TimerData;

static int64_t next_timeout_id = 1;

static void timer_callback(uv_timer_t *handle) {
    TimerData *timer_data = (TimerData *)handle->data;
    JSContext *ctx = timer_data->ctx;
    
    if (!JS_IsNull(timer_data->callback)) {
        JSValue ret, func;
        func = JS_DupValue(ctx, timer_data->callback);
        ret = JS_Call(ctx, func, JS_UNDEFINED, 0, NULL);
        JS_FreeValue(ctx, func);
        
        if (JS_IsException(ret)) {
            js_std_dump_error(ctx);
        }
        JS_FreeValue(ctx, ret);
    }
    
    if (!timer_data->is_interval) {
        JS_FreeValue(ctx, timer_data->callback);
        free(timer_data);
        uv_close((uv_handle_t *)handle, (uv_close_cb)free);
    }
}

JSValue js_set_timeout(JSContext *ctx, JSValue this_val, int argc, JSValue *argv) {
    if (argc < 1 || !JS_IsFunction(ctx, argv[0])) {
        return JS_ThrowTypeError(ctx, "callback must be a function");
    }
    
    int64_t delay = 0;
    if (argc > 1 && JS_IsNumber(argv[1])) {
        JS_ToInt64(ctx, &delay, argv[1]);
    }
    
    TimerData *timer_data = malloc(sizeof(TimerData));
    if (!timer_data) {
        return JS_ThrowOutOfMemory(ctx);
    }
    
    timer_data->ctx = ctx;
    timer_data->callback = JS_DupValue(ctx, argv[0]);
    timer_data->is_interval = 0;
    timer_data->timeout_id = next_timeout_id++;
    
    uv_loop_t *loop = uv_default_loop();
    uv_timer_init(loop, &timer_data->timer);
    timer_data->timer.data = timer_data;
    
    uv_timer_start(&timer_data->timer, timer_callback, delay, 0);
    
    return JS_NewInt64(ctx, timer_data->timeout_id);
}

JSValue js_set_interval(JSContext *ctx, JSValue this_val, int argc, JSValue *argv) {
    if (argc < 1 || !JS_IsFunction(ctx, argv[0])) {
        return JS_ThrowTypeError(ctx, "callback must be a function");
    }
    
    int64_t interval = 0;
    if (argc > 1 && JS_IsNumber(argv[1])) {
        JS_ToInt64(ctx, &interval, argv[1]);
    }
    
    TimerData *timer_data = malloc(sizeof(TimerData));
    if (!timer_data) {
        return JS_ThrowOutOfMemory(ctx);
    }
    
    timer_data->ctx = ctx;
    timer_data->callback = JS_DupValue(ctx, argv[0]);
    timer_data->is_interval = 1;
    timer_data->timeout_id = next_timeout_id++;
    
    uv_loop_t *loop = uv_default_loop();
    uv_timer_init(loop, &timer_data->timer);
    timer_data->timer.data = timer_data;
    
    uv_timer_start(&timer_data->timer, timer_callback, interval, interval);
    
    return JS_NewInt64(ctx, timer_data->timeout_id);
}

typedef struct {
    JSContext *ctx;
    JSValue callback;
    int64_t immediate_id;
    uv_check_t check;
} ImmediateData;

static void immediate_callback(uv_check_t *handle) {
    ImmediateData *immediate_data = (ImmediateData *)handle->data;
    JSContext *ctx = immediate_data->ctx;
    
    if (!JS_IsNull(immediate_data->callback)) {
        JSValue ret, func;
        func = JS_DupValue(ctx, immediate_data->callback);
        ret = JS_Call(ctx, func, JS_UNDEFINED, 0, NULL);
        JS_FreeValue(ctx, func);
        
        if (JS_IsException(ret)) {
            js_std_dump_error(ctx);
        }
        JS_FreeValue(ctx, ret);
    }
    
    JS_FreeValue(ctx, immediate_data->callback);
    free(immediate_data);
    uv_close((uv_handle_t *)handle, (uv_close_cb)free);
}

JSValue js_set_immediate(JSContext *ctx, JSValue this_val, int argc, JSValue *argv) {
    if (argc < 1 || !JS_IsFunction(ctx, argv[0])) {
        return JS_ThrowTypeError(ctx, "callback must be a function");
    }
    
    ImmediateData *immediate_data = malloc(sizeof(ImmediateData));
    if (!immediate_data) {
        return JS_ThrowOutOfMemory(ctx);
    }
    
    immediate_data->ctx = ctx;
    immediate_data->callback = JS_DupValue(ctx, argv[0]);
    immediate_data->immediate_id = next_timeout_id++;
    
    uv_loop_t *loop = uv_default_loop();
    uv_check_init(loop, &immediate_data->check);
    immediate_data->check.data = immediate_data;
    uv_check_start(&immediate_data->check, immediate_callback);
    
    return JS_NewInt64(ctx, immediate_data->immediate_id);
}

static void clear_timer_or_immediate(int64_t id) {
    // This is a simplified version - in a real implementation you'd need
    // to track all active timers/immediates and find the right one to clear
    // For a complete solution, you'd need a hash table or similar structure
    // to map IDs to timer/immediate handles
}

JSValue js_clear_timeout(JSContext *ctx, JSValue this_val, int argc, JSValue *argv) {
    if (argc < 1 || !JS_IsNumber(argv[0])) {
        return JS_UNDEFINED;
    }
    
    int64_t id;
    JS_ToInt64(ctx, &id, argv[0]);
    clear_timer_or_immediate(id);
    
    return JS_UNDEFINED;
}

JSValue js_clear_immediate(JSContext *ctx, JSValue this_val, int argc, JSValue *argv) {
    return js_clear_timeout(ctx, this_val, argc, argv);
}

typedef struct {
    JSContext *ctx;
    JSValue callback;
    int argc;
    JSValue *argv;
} NextTickData;

static JSValue next_tick_job(JSContext *ctx, int argc, JSValue *argv) {
    NextTickData *data = JS_GetContextOpaque(ctx);
    
    if (!JS_IsNull(data->callback)) {
        JSValue ret = JS_Call(ctx, data->callback, JS_UNDEFINED, data->argc, data->argv);
        if (JS_IsException(ret)) {
            js_std_dump_error(ctx);
        }
        JS_FreeValue(ctx, ret);
    }
    
    // Cleanup
    JS_FreeValue(ctx, data->callback);
    for (int i = 0; i < data->argc; i++) {
        JS_FreeValue(ctx, data->argv[i]);
    }
    free(data->argv);
    free(data);
    
    return JS_UNDEFINED;
}

static JSValue js_process_next_tick(JSContext *ctx, JSValue this_val, int argc, JSValue *argv) {
    if (argc < 1 || !JS_IsFunction(ctx, argv[0])) {
        return JS_ThrowTypeError(ctx, "callback must be a function");
    }

    // Prepare the next tick data
    NextTickData *data = malloc(sizeof(NextTickData));
    if (!data) {
        return JS_ThrowOutOfMemory(ctx);
    }
    
    data->ctx = ctx;
    data->callback = JS_DupValue(ctx, argv[0]);
    data->argc = argc - 1;
    
    if (argc > 1) {
        data->argv = malloc(sizeof(JSValue) * (argc - 1));
        if (!data->argv) {
            free(data);
            return JS_ThrowOutOfMemory(ctx);
        }
        
        for (int i = 1; i < argc; i++) {
            data->argv[i-1] = JS_DupValue(ctx, argv[i]);
        }
    } else {
        data->argv = NULL;
    }

    // Create and enqueue the job
    if (JS_EnqueueJob(ctx, next_tick_job, 0, NULL) < 0) {
        // Cleanup if enqueue fails
        JS_FreeValue(ctx, data->callback);
        for (int i = 0; i < data->argc; i++) {
            JS_FreeValue(ctx, data->argv[i]);
        }
        free(data->argv);
        free(data);
        return JS_ThrowOutOfMemory(ctx);
    }

    // Store the data in context opaque (simplified - in real code you'd need a proper storage mechanism)
    JS_SetContextOpaque(ctx, data);

    return JS_UNDEFINED;
}

#define countof(arr) (sizeof(arr) / sizeof(*arr))

static const JSCFunctionListEntry bindings_funcs[] = {
    JS_CFUNC_DEF("setTimeout", 2, js_set_timeout),
    JS_CFUNC_DEF("clearTimeout", 1, js_clear_timeout),
    JS_CFUNC_DEF("setInterval", 2, js_set_interval),
    JS_CFUNC_DEF("clearInterval", 1, js_clear_timeout),
    JS_CFUNC_DEF("setImmediate", 1, js_set_immediate),
    JS_CFUNC_DEF("clearImmediate", 1, js_clear_immediate),
    JS_CFUNC_DEF("nextTick", 1, js_process_next_tick),
};

static int bindings_module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
}

void js_init_timers_bindings(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, bindings_module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
    
    return m;
}