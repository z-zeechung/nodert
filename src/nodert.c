#include <stdio.h>
#include <quickjs.h>
#include <quickjs-libc.h>
#include <event_queue.h>
#include "bindings.h"
#include "resource.h"
#include "global.h"

int p_argc;
char **p_argv;

static void print_js_error(JSContext *ctx, JSValue error) {
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

// taken from quickjs-libc.c
/* main loop which calls the user JS callbacks */
int nodert_loop(JSContext *ctx/*, uv_loop_t *loop*/)
{
    JSRuntime *rt = JS_GetRuntime(ctx);
    // JSThreadState *ts = js_get_thread_state(rt);     // seems that we'd have to give up qjs:os... alright, i admit it
    JSContext *ctx1;
    int err;

    for(;;) {

        /* execute nextTick jobs */
        consume_next_tick_event_queue(ctx);

        /* execute the pending jobs */
        for(;;) {
            err = JS_ExecutePendingJob(JS_GetRuntime(ctx), &ctx1);
            if (err <= 0) {
                if (err < 0)
                    goto done;
                break;
            }
        }

        // if (!ts->can_js_os_poll || js_os_poll(ctx))
        //     break;

        /* execute timer jobs */
        uint64_t min_delay;
        consume_timeout_event_queue(ctx, &min_delay);

        /* execute immediate jobs */
        consume_immediate_event_queue(ctx);

        if(!JS_IsJobPending(rt) && !has_pending_event_queue_jobs()) {
            if(min_delay>0){
                Sleep(min_delay);
            }else{
                break;
            }
        }
    }
done:
    return JS_HasException(ctx);
}

int main(int argc, char *argv[]) {

    p_argc = argc;
    p_argv = argv;

    JSRuntime *rt = JS_NewRuntime();
    JS_SetHostPromiseRejectionTracker(rt, js_std_promise_rejection_tracker, NULL);
    JSContext *ctx = JS_NewContext(rt);

    init_event_queues();

    js_std_add_helpers(ctx, argc, argv);
    js_std_init_handlers(rt);

    js_init_module_std(ctx, "qjs:std");
    js_init_module_os(ctx, "qjs:os");

    js_init_bindings(ctx, "bindings");
    // js_init_fs_bindings(ctx, "fs");

    FILE *file = fopen("lib/main.js", "r");
    char script[1024*32];
    size_t bytes_read = fread(script, 1, sizeof(script)-1, file);
    fclose(file);
    script[bytes_read] = '\0';  // important

    char* init_bindings_script = load_utf8_resource_file(IDR_INIT_BINDINGS);
    JS_Eval(ctx, init_bindings_script, strlen(init_bindings_script), "<init_bindings>", JS_EVAL_TYPE_GLOBAL | JS_EVAL_FLAG_STRICT | JS_EVAL_TYPE_MODULE);

    JSValue result = JS_Eval(ctx, script, strlen(script), "<internal>", JS_EVAL_TYPE_GLOBAL | JS_EVAL_FLAG_STRICT | JS_EVAL_TYPE_MODULE);

    int ret = 0;
    if (JS_IsException(result)) {
        JSValue exception = JS_GetException(ctx);
        print_js_error(ctx, exception);
        JS_FreeValue(ctx, exception);
        ret = -1;
    } else {
        // int result = nodert_loop(ctx/*, loop*/);
        int result = js_std_loop(ctx);
        if (result != 0) {
            JSValue exception = JS_GetException(ctx);
            print_js_error(ctx, exception);
            JS_FreeValue(ctx, exception);
            ret = -1;
        }
    }

    JS_FreeValue(ctx, result);
    js_std_free_handlers(rt);
    // freeNextTickJobQueue(ctx);
    JS_FreeContext(ctx);
    JS_FreeRuntime(rt);

    return ret;
}