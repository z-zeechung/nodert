function jsValueToCValue(idx, type){
    switch (type){
        case "int32": return `
            int32_t var${idx}; JS_ToInt32(ctx, &var${idx}, argv[${idx}]);
        `
        case "uint32": return `
            uint32_t var${idx}; JS_ToUint32(ctx, &var${idx}, argv[${idx}]);
        `
        case "int64": return `
            int64_t var${idx}; JS_ToInt64(ctx, &var${idx}, argv[${idx}]);
        `
        case "string": return `
            const char* var${idx} = JS_ToCString(ctx, argv[${idx}]);
        `
        case "boolean": return `
            bool var${idx} = JS_ToBool(ctx, argv[${idx}]);
        `
        case "arraybuffer": return `
            array_buffer var${idx};
            var${idx}.data = JS_GetArrayBuffer(ctx, &(var${idx}.size), argv[${idx}]);
        `
        default: throw new Error("Unknown type: " + type);
    }
}

function recycleJsValue(idx, type){
    switch (type){
        case "string": return `
            JS_FreeCString(ctx, var${idx});
        `
        default: return undefined
    }
}

function cValueToJsValue(type){
    switch (type){
        case "int32": return `
            JSValue js_retval = JS_NewInt32(ctx, retval);
        `
        case "uint32": return `
            JSValue js_retval = JS_NewUint32(ctx, retval);
        `
        case "int64": return `
            JSValue js_retval = JS_NewInt64(ctx, retval);
        `
        case "string": return `
            JSValue js_retval;
            if(retval == NULL) {
                js_retval = JS_UNDEFINED;
            }else{
                js_retval = JS_NewStringLen(ctx, retval, strlen(retval));
            }
        `
        case "boolean": return `
            JSValue js_retval = JS_NewBool(ctx, retval);
        `
        case "void": return `
            JSValue js_retval = JS_UNDEFINED;
        `
        case "int64array": return `
            JSValue js_retval;
            if(retval.count == 0 || retval.data == NULL){
                js_retval = JS_UNDEFINED;
            }else{
                js_retval = JS_NewArray(ctx);
                for(int i=0;i<retval.count;i++){
                    if(retval.data[i] == NULL){
                        JS_SetPropertyUint32(ctx, js_retval, i, 
                            JS_UNDEFINED);
                    }else{
                        JS_SetPropertyUint32(ctx, js_retval, i, 
                            JS_NewInt64(ctx, retval.data[i]));    
                    }

                }
            }
        `
        case "stringarray": return `
            JSValue js_retval;
            if(retval.count == 0 || retval.strs == NULL){
                js_retval = JS_UNDEFINED;
            }else{
                js_retval = JS_NewArray(ctx);
                for(int i=0;i<retval.count;i++){
                    if(retval.strs[i] == NULL){
                        JS_SetPropertyUint32(ctx, js_retval, i,
                            JS_UNDEFINED);
                    }else{
                        JS_SetPropertyUint32(ctx, js_retval, i, 
                            JS_NewStringLen(ctx, retval.strs[i], strlen(retval.strs[i])) );
                    }
                }
            }
        `
        default: throw new Error("unknown type: " + type);
    }
}

function recycleCValue(type){
    switch(type){
        case "string": return `
            if(retval) { free(retval); }
        `
        case "int64array": return `
            if(retval.data) { free(retval.data); }
        `
        case "stringarray": return `
            if(retval.strs){
                for(int i=0;i<retval.count;i++){
                    free(retval.strs[i]);
                }
                free(retval.strs);
            }
        `
    }
}

const nameAndType = {
    "int32": "int32_t",
    "uint32": "uint32_t",
    "int64": "int64_t",
    "string": "char*",
    "boolean": "bool",
    "arraybuffer": "array_buffer",
    "int64array": "int64_array",
    "stringarray": "string_array",
}

function gen_wrapper(moduleName, wrapperName, bindingName, params, ret){

    let js2c = params.map((p, idx)=>jsValueToCValue(idx, p)).join("\n");

    let invoke;
    let vars = Array.from({length: params.length})
                    .map((_, idx)=>`var${idx}`).join(", ");
    if(ret==="void"){
        invoke = `${bindingName}(${vars});`
    }else{
        let type = nameAndType[ret];
        invoke = `${type} retval = ${bindingName}(${vars});`
    }

    let c2js = cValueToJsValue(ret)

    let recycleJS = []
    params.forEach((p, idx)=>{
        let code = recycleJsValue(idx, p)
        if(code) recycleJS.push(code)
    })
    recycleJS = recycleJS.join("\n")

    let recycleC = []
    let code = recycleCValue(ret)
    if(code) recycleC.push(code)
    recycleC = recycleC.join("\n")

    return `
static JSValue ${moduleName}_${wrapperName}_wrapper(
    JSContext* ctx, JSValueConst this_val, int argc, JSValueConst* argv
){
    ${js2c}
    errno = 0;
    ${invoke}
    if(errno!=0){   // TODO
        ${recycleJS}
        return JS_ThrowInternalError(ctx, "errno is not 0");
    }
    ${c2js}
    ${recycleJS}
    ${recycleC}
    return js_retval;
}
    `
}

function gen_async_wrapper(moduleName, wrapperName, bindingName, params, ret){
    let payloadInput = params.map(name=>nameAndType[name])
        .map((type, idx)=>`${type} var${idx};`).join(" ");
    let payloadReturn = ret=='void'?"":`${nameAndType[ret]} retval;`
    let payload = `
        struct ${moduleName}_${wrapperName}_wrapper_payload {
            JSContext* ctx; JSValueConst this_val;
            ${payloadInput}
            ${payloadReturn}
            JSValue cb; int errnum;
        };
    `

    let js2c = params.map((p, idx)=>jsValueToCValue(idx, p)).join("\n");
    let fillPayload = Array.from({length: params.length})
        .map((_, idx)=>`payload->var${idx} = var${idx};`).join("\n");
    let wrapper = `
static JSValue ${moduleName}_${wrapperName}_wrapper(
    JSContext* ctx, JSValueConst this_val, int argc, JSValueConst* argv
){
    ${js2c}
    struct ${moduleName}_${wrapperName}_wrapper_payload* payload
        = (struct ${moduleName}_${wrapperName}_wrapper_payload*)malloc(sizeof(struct ${moduleName}_${wrapperName}_wrapper_payload));

    ${fillPayload}
    payload->ctx = ctx; payload->this_val = this_val;
    payload->cb = JS_DupValue(ctx, argv[${params.length}]);
    payload->errnum = 0;

    push_to_generic_event_queue(
        ${moduleName}_${wrapperName}_wrapper_worker,
        payload,
        ${moduleName}_${wrapperName}_wrapper_event
    );

    return JS_UNDEFINED;
}
    `

    let invoke;
    let vars = Array.from({length: params.length})
                    .map((_, idx)=>`payload->var${idx}`).join(", ");
    if(ret==="void"){
        invoke = `${bindingName}(${vars});`
    }else{
        invoke = `payload->retval = ${bindingName}(${vars});`
    }
    let worker = `
static void ${moduleName}_${wrapperName}_wrapper_worker(
    struct ${moduleName}_${wrapperName}_wrapper_payload* payload
){
    errno = 0;
    ${invoke}
    payload->errnum = errno;
}
    `

    let recycleJS = []
    params.forEach((p, idx)=>{
        let code = recycleJsValue(idx, p)
        if(code) recycleJS.push(code)
    })
    recycleJS = recycleJS.join("\n")

    let recycleC = []
    let code = recycleCValue(ret)
    if(code) recycleC.push(code)
    recycleC = recycleC.join("\n")

    let exposeInputs = params.map(name=>nameAndType[name])
        .map((type, idx)=>`${type} var${idx} = payload->var${idx};`)
        .join("\n")
    let exposeOutput = ret=='void'?'':`${nameAndType[ret]} retval = payload->retval;`

    let c2js = cValueToJsValue(ret)

    let event = `
static void ${moduleName}_${wrapperName}_wrapper_event(
    struct ${moduleName}_${wrapperName}_wrapper_payload* payload
){

    ${exposeInputs}
    ${exposeOutput}
    JSContext* ctx = payload->ctx;

    ${c2js}

    JSValue returns[2];
    if(payload->errnum != 0){   // TODO
        returns[0] = JS_NewError(ctx);
        returns[1] = JS_UNDEFINED;
    }else{
        returns[0] = JS_UNDEFINED;
        returns[1] = js_retval;
    }
    JS_Call(
        payload->ctx, 
        payload->cb, 
        payload->this_val, 
        2, returns
    );

    ${recycleJS}
    if(payload->errnum == 0){
        ${recycleC}
    }

    JS_FreeValue(ctx, payload->cb);
    free(payload);
}
    `

    return `
        ${payload}
        ${event}
        ${worker}
        ${wrapper}
    `
}

import init, { format } from "@wasm-fmt/clang-format";
await init()
const formatConfig = JSON.stringify({
  BasedOnStyle: "Google",
  IndentWidth: 4,
  ColumnLimit: 80,
});
function format_code(code){
    code = format(
        code,
        "main.cc",
        formatConfig,
    );
    
    return code
}


import fs from "fs"
import path from "path"
import payload from "../src/fs.json" assert { type: 'json' };
let wrappers = []
for(let module of payload.bindings){
    let generator = module['async'] ? gen_async_wrapper : gen_wrapper
    const code = generator(
        payload.name,
        module.name,
        module.function,
        module.params,
        module["return"]
    )
    wrappers.push(format_code(code))
}
wrappers = wrappers.join("\n\n")

let includes = payload.includes.map(x => `#include "${x.name}"`).join("\n")

let bindings_funcs = payload.bindings.map(binding=>
`   JS_CFUNC_DEF("${binding.name}", ${binding.params.length+(binding.async?1:0)}, ${payload.name}_${binding.name}_wrapper),`
).join("\n")

const code = `
/**
 * THIS FILE WAS AUTO GENERATED BY \`\`
 * RUN \`\` TO REGENERATE THIS FILE
 */

${includes}

#include <quickjs.h>
#include <errno.h>
#include "types.h"
#include "event_queue.h"

${wrappers}

#define countof(arr) (sizeof(arr) / sizeof(*arr))

static const JSCFunctionListEntry bindings_funcs[] = {
${bindings_funcs}
};

static int bindings_module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
}

JSModuleDef *js_init_${payload.name}_bindings(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, bindings_module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, bindings_funcs, countof(bindings_funcs));
    
    return m;
}
`

fs.writeFileSync("src/fs.c", code)