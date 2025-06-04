#include "bindings.h"

#define countof(arr) (sizeof(arr) / sizeof(*arr))


static JSValue foobar(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_NewString(ctx, "foobar");
}


static const JSCFunctionListEntry bindings_funcs[] = {
    JS_CFUNC_DEF("foobar", 0, foobar),
};

static int bindings_module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
}

JSModuleDef *js_init_bindings(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, bindings_module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
    
    return m;
}