
#include "bindings.h"

#include <windows.h>
#include <stdlib.h>
#include <string.h>
#include <shlobj.h>
#include <Lmcons.h>

#define countof(arr) (sizeof(arr) / sizeof(*arr))

static char* convert_utf16_to_utf8(const wchar_t* wide_string) {
    int utf8_len = WideCharToMultiByte(CP_UTF8, 0, wide_string, -1, NULL, 0, NULL, NULL);
    if (utf8_len <= 0) {
        return NULL;
    }

    char *utf8_string = (char *)malloc(utf8_len);
    if (!utf8_string) {
        return NULL;
    }

    if (WideCharToMultiByte(CP_UTF8, 0, wide_string, -1, utf8_string, utf8_len, NULL, NULL) == 0) {
        free(utf8_string);
        return NULL;
    }

    return utf8_string;
}

static JSValue getHostname(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    wchar_t hostname_utf16[MAX_COMPUTERNAME_LENGTH + 1];
    DWORD size = (DWORD)_countof(hostname_utf16);

    if (!GetComputerNameExW(ComputerNamePhysicalDnsHostname, hostname_utf16, &size)) {
        return JS_ThrowInternalError(ctx, "Failed to get hostname");
    }

    char *hostname_utf8 = convert_utf16_to_utf8(hostname_utf16);
    if (!hostname_utf8) {
        return JS_ThrowInternalError(ctx, "Failed to convert hostname to UTF-8");
    }

    JSValue result = JS_NewString(ctx, hostname_utf8);
    free(hostname_utf8);
    return result;
}

static JSValue getUptime(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    double uptime_seconds = GetTickCount64() / 1000.0;
    return JS_NewFloat64(ctx, uptime_seconds);
}

static JSValue getTotalMem(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    MEMORYSTATUSEX memInfo;
    memInfo.dwLength = sizeof(memInfo);
    if (GlobalMemoryStatusEx(&memInfo)) {
        DWORDLONG totalPhys = memInfo.ullTotalPhys;
        return JS_NewBigUint64(ctx, totalPhys);
    }
    return JS_ThrowInternalError(ctx, "Failed to get total memory");
}

static JSValue getFreeMem(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    MEMORYSTATUSEX memInfo;
    memInfo.dwLength = sizeof(memInfo);
    if (GlobalMemoryStatusEx(&memInfo)) {
        DWORDLONG freePhys = memInfo.ullAvailPhys;
        return JS_NewBigUint64(ctx, freePhys);
    }
    return JS_ThrowInternalError(ctx, "Failed to get free memory");
}

static JSValue getHomeDirectory(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    LPWSTR buffer[MAX_PATH+1];
    if(!SUCCEEDED(SHGetFolderPathW(NULL, CSIDL_PROFILE, NULL, 0, buffer))){
        return JS_ThrowInternalError(ctx, "Failed to get home directory");
    }

    char* hd_utf8 = convert_utf16_to_utf8(buffer);
    if(!hd_utf8){
        return JS_ThrowInternalError(ctx, "Failed to convert home directory to utf8");
    }

    JSValue homeDir = JS_NewString(ctx, hd_utf8);
    free(hd_utf8);
    return homeDir;
}

static JSValue get_uid(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    return JS_NewUint32(ctx, 0xFFFFFFFF);
}

static JSValue get_gid(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    return JS_NewUint32(ctx, 0xFFFFFFFF);
}

static JSValue get_username(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    char username[UNLEN + 1];
    DWORD size = UNLEN + 1;
    if(!GetUserNameW(username, &size)){
        return JS_ThrowInternalError(ctx, "Failed to get username");
    }

    char* username_utf8 = convert_utf16_to_utf8(username);
    if(!username_utf8){
        return JS_ThrowInternalError(ctx, "Failed to convert username to utf8");
    }

    JSValue username_js = JS_NewString(ctx, username_utf8);
    free(username_utf8);
    return username_js;
}

static JSValue get_shell(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    return JS_UNDEFINED;
}

static JSValue get_sysname(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    return JS_NewString(ctx, "Windows_NT");
}

static JSValue get_version(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    WCHAR productName[256] = {0};
    DWORD bufferSize = sizeof(productName);
    HKEY hKey;
    if (RegOpenKeyExW(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
        RegQueryValueExW(hKey, L"ProductName", NULL, NULL, (LPBYTE)productName, &bufferSize);
        RegCloseKey(hKey);
    }else{
        return JS_ThrowInternalError(ctx, "Failed to open registry key");
    }
    char* productName_utf8 = convert_utf16_to_utf8(productName);
    if(!productName_utf8){
        // return JS_ThrowInternalError(ctx, "Failed to convert productName to utf8");
        return JS_UNDEFINED;
    }
    JSValue productName_js = JS_NewString(ctx, productName_utf8);
    free(productName_utf8);
    return productName_js;
}

static JSValue get_release(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    typedef LONG(NTAPI* RtlGetVersionFunc)(PRTL_OSVERSIONINFOW);
    HMODULE hNtDll = GetModuleHandleW(L"ntdll.dll");
    if (hNtDll) {
        RtlGetVersionFunc RtlGetVersion = (RtlGetVersionFunc)GetProcAddress(hNtDll, "RtlGetVersion");
        if (RtlGetVersion) {
            RTL_OSVERSIONINFOW rovi = { sizeof(RTL_OSVERSIONINFOW) };
            if (RtlGetVersion(&rovi) == 0) {
                char release[256];
                snprintf(release, sizeof(release), "%d.%d.%d", rovi.dwMajorVersion, rovi.dwMinorVersion, rovi.dwBuildNumber);
                return JS_NewString(ctx, release);
            }
        }
    }
    return JS_ThrowInternalError(ctx, "Failed to get release");
}

#if defined(_M_X64)
    #define ARCH "x86_64"
#elif defined(_M_IX86)
    #define ARCH "x86"
#elif defined(_M_ARM64)
    #define ARCH "arm64"
#elif defined(_M_ARM)
    #define ARCH "arm"
#else
    #define ARCH "unknown"
#endif
static JSValue get_machine(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    return JS_NewString(ctx, ARCH);
}

static JSValue isBigEndian(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    return JS_FALSE;
}

static const JSCFunctionListEntry os_funcs[] = {
    JS_CFUNC_DEF("getHostname", 0, getHostname),
    JS_CFUNC_DEF("getUptime", 0, getUptime),
    JS_CFUNC_DEF("getTotalMem", 0, getTotalMem),
    JS_CFUNC_DEF("getFreeMem", 0, getFreeMem),
    JS_CFUNC_DEF("getHomeDirectory", 0, getHomeDirectory),
    JS_CFUNC_DEF("get_uid", 0, get_uid),
    JS_CFUNC_DEF("get_gid", 0, get_gid),
    JS_CFUNC_DEF("get_username", 0, get_username),
    JS_CFUNC_DEF("get_shell", 0, get_shell),
    JS_CFUNC_DEF("get_sysname", 0, get_sysname),
    JS_CFUNC_DEF("get_version", 0, get_version),
    JS_CFUNC_DEF("get_release", 0, get_release),
    JS_CFUNC_DEF("get_machine", 0, get_machine),
    JS_CFUNC_DEF("isBigEndian", 0, isBigEndian),
};

static int os_module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, os_funcs, countof(os_funcs));
}

JSModuleDef *js_init_binding_os(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, os_module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, os_funcs, countof(os_funcs));
    
    return m;
}