#include <uvw.hpp>
#include "timers.h"
#include <unordered_map>
#include <atomic>


typedef struct {
    std::shared_ptr<uvw::timer_handle> timer;
    JSValue callback;
    JSValue global_obj;
} Timer;

static std::unordered_map<uint64_t, Timer> timers;

static int timer_id = 0;

// setTimeout. input: cb, delay
static JSValue setTimeout(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {

    // Get callback
    JSValue callback = JS_DupValue(ctx, argv[0]);

    // Get delay 
    uint64_t delay; JS_ToIndex(ctx, &delay, argv[1]);

    // Get global object
    JSValue global_obj = JS_GetGlobalObject(ctx);

    auto loop = uvw::loop::get_default();
    auto timer = loop->resource<uvw::timer_handle>();

    int id = timer_id++; 

    Timer t = {timer, callback, global_obj};
    timers[id] = t;

    // Setup timer callback
    timer->on<uvw::timer_event>([ctx, callback, global_obj, id](const auto&, auto& handle) {

        JS_Call(ctx, callback, global_obj, 0, {});

        // Cleanup
        if(timers.find(id) != timers.end()){
            JS_FreeValue(ctx, callback);
            JS_FreeValue(ctx, global_obj);
            timers.erase(id);
        }

        handle.close();
    });

    // Start timer
    timer->start(uvw::timer_handle::time{delay}, uvw::timer_handle::time{0});

    return JS_NewInt64(ctx, id);
}

// clearTimeout
static JSValue clearTimeout(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {

    int64_t id; JS_ToInt64(ctx, &id, argv[0]);

    auto it = timers.find(id);
    if (it != timers.end()) {
        Timer& t = it->second;
        
        t.timer->stop();
        t.timer->close();

        JS_FreeValue(ctx, t.callback);
        JS_FreeValue(ctx, t.global_obj);
        timers.erase(id);
    }

    return JS_UNDEFINED;
}

// setInterval
static JSValue setInterval(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    // Get callback
    JSValue callback = JS_DupValue(ctx, argv[0]);

    // Get interval
    uint64_t interval; JS_ToIndex(ctx, &interval, argv[1]);

    // Get global object
    JSValue global_obj = JS_GetGlobalObject(ctx);

    auto loop = uvw::loop::get_default();
    auto timer = loop->resource<uvw::timer_handle>();

    int id = timer_id++; 

    timers[id] = {timer, callback, global_obj};

    // Setup timer callback
    timer->on<uvw::timer_event>([ctx, callback, global_obj, id](const auto&, auto& handle) {

        JS_Call(ctx, callback, global_obj, 0, {});

    });

    timer->start(uvw::timer_handle::time{0}, uvw::timer_handle::time{interval});

    return JS_NewInt64(ctx, id);
}

// clearInterval
static JSValue clearInterval(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    // Get id
    uint64_t id; JS_ToIndex(ctx, &id, argv[0]);

    if(timers.find(id) != timers.end()){
        Timer& t = timers[id];
        t.timer->stop();
        t.timer->close();
        JS_FreeValue(ctx, t.callback);
        JS_FreeValue(ctx, t.global_obj);
        timers.erase(id);
    }

    return JS_UNDEFINED;
}


typedef struct {
    std::shared_ptr<uvw::check_handle> check; 
    JSValue callback;
    JSValue global_obj;
} Immediate;

static std::unordered_map<uint64_t, Immediate> immediates;
static int immediate_id = 0;

static JSValue setImmediate(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    // Get callback
    JSValue callback = JS_DupValue(ctx, argv[0]);

    // Get global object
    JSValue global_obj = JS_GetGlobalObject(ctx);

    auto loop = uvw::loop::get_default();
    auto check = loop->resource<uvw::check_handle>();

    int id = immediate_id++;

    Immediate imm = {check, callback, global_obj};
    immediates[id] = imm;

    // Setup check callback
    check->on<uvw::check_event>([ctx, callback, global_obj, id](const auto&, auto& handle) {
        // Execute callback
        JS_Call(ctx, callback, global_obj, 0, {});

        // Cleanup
        if (immediates.find(id) != immediates.end()) {
            JS_FreeValue(ctx, callback);
            JS_FreeValue(ctx, global_obj);
            immediates.erase(id);
        }

        handle.close();
    });

    // Start check handle
    check->start();

    return JS_NewInt64(ctx, id);
}

static JSValue clearImmediate(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int64_t id;
    JS_ToInt64(ctx, &id, argv[0]);

    auto it = immediates.find(id);
    if (it != immediates.end()) {
        Immediate& imm = it->second;
        
        imm.check->stop();
        imm.check->close();

        JS_FreeValue(ctx, imm.callback);
        JS_FreeValue(ctx, imm.global_obj);
        immediates.erase(id);
    }

    return JS_UNDEFINED;
}


static int bindings_module_init(JSContext *ctx, JSModuleDef *m) {

    JS_SetModuleExport(ctx, m, "setTimeout", JS_NewCFunction(ctx, setTimeout, "setTimeout", 2));
    JS_SetModuleExport(ctx, m, "clearTimeout", JS_NewCFunction(ctx, clearTimeout, "clearTimeout", 1));
    JS_SetModuleExport(ctx, m, "setInterval", JS_NewCFunction(ctx, setInterval, "setInterval", 2));
    JS_SetModuleExport(ctx, m, "clearInterval", JS_NewCFunction(ctx, clearInterval, "clearInterval", 1));
    JS_SetModuleExport(ctx, m, "setImmediate", JS_NewCFunction(ctx, setImmediate, "setImmediate", 1));
    JS_SetModuleExport(ctx, m, "clearImmediate", JS_NewCFunction(ctx, clearImmediate, "clearImmediate", 1));

    return 0;
}

extern "C" {
    JSModuleDef *js_init_timers_bindings(JSContext *ctx, const char *module_name) {
        JSModuleDef *m = JS_NewCModule(ctx, module_name, bindings_module_init);
        if (!m) return NULL;
        
        JS_AddModuleExport(ctx, m, "setTimeout");
        JS_AddModuleExport(ctx, m, "clearTimeout");
        JS_AddModuleExport(ctx, m, "setInterval");
        JS_AddModuleExport(ctx, m, "clearInterval");
        JS_AddModuleExport(ctx, m, "setImmediate");
        JS_AddModuleExport(ctx, m, "clearImmediate");
        
        return m;
    }
}