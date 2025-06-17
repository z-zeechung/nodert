#include "bindings.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <windows.h>
#include <tlhelp32.h>
#include <fcntl.h>
#include <io.h>
#include <shlobj.h>
#include <lmcons.h>
#include <signal.h>
#include <sys/stat.h>
static wchar_t* utf8_to_wchar(const char* utf8) {
    if (!utf8) return NULL;

    int size = MultiByteToWideChar(CP_UTF8, 0, utf8, -1, NULL, 0);
    if (size == 0) return NULL;

    wchar_t* wstr = (wchar_t*)malloc(size * sizeof(wchar_t));
    if (!wstr) return NULL;

    if (MultiByteToWideChar(CP_UTF8, 0, utf8, -1, wstr, size) == 0) {
        free(wstr);
        return NULL;
    }

    return wstr;
}
static char *wstr_to_utf8(JSContext *ctx, const wchar_t *wstr) {
    if (!wstr) return NULL;

    int utf8_size = WideCharToMultiByte(
        CP_UTF8, 0, wstr, -1, NULL, 0, NULL, NULL
    );
    if (utf8_size == 0) return NULL;

    char *utf8_str = js_malloc(ctx, utf8_size);
    if (!utf8_str) return NULL;

    if (WideCharToMultiByte(
        CP_UTF8, 0, wstr, -1, utf8_str, utf8_size, NULL, NULL
    ) == 0) {
        js_free(ctx, utf8_str);
        return NULL;
    }

    return utf8_str;
}


#define countof(arr) (sizeof(arr) / sizeof(*arr))


// get current architecture
static JSValue arch(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    #if defined(__x86_64__) || defined(_M_X64)
        #define ARCH "x64"
    #elif defined(__i386__) || defined(_M_IX86)
        #define ARCH "ia32"
    #elif defined(__aarch64__) || defined(_M_ARM64)
        #define ARCH "arm64"
    #elif defined(__arm__) || defined(_M_ARM)
        #define ARCH "arm"
    #elif defined(__mips__)
        #define ARCH "mips"
    #elif defined(__powerpc64__) || defined(__ppc64__)
        #define ARCH "ppc64"
    #elif defined(__powerpc__) || defined(__ppc__)
        #define ARCH "ppc"
    #elif defined(__riscv)
        #define ARCH "riscv64"
    #elif defined(__s390x__)
        #define ARCH "s390x"
    #elif defined(__s390__)
        #define ARCH "s390"
    #else
        #define ARCH "unknown"
    #endif
    return JS_NewString(ctx, ARCH);
}

// get current os's name
static JSValue platform(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    #if defined(_WIN32) || defined(_WIN64)
        #define PLATFORM "win32" // Windows 
    #elif defined(__APPLE__) || defined(__MACH__)
        #define PLATFORM "darwin" // macOS and iOS
    #elif defined(__linux__)
        #define PLATFORM "linux"  // Linux
    #elif defined(__FreeBSD__)
        #define PLATFORM "freebsd" // FreeBSD
    #elif defined(__OpenBSD__)
        #define PLATFORM "openbsd" // OpenBSD
    #elif defined(__sun) || defined(__sun__)
        #define PLATFORM "sunos"  // Solaris/SunOS
    #elif defined(_AIX)
        #define PLATFORM "aix"    // IBM AIX
    #else
        #define PLATFORM "unknown" 
    #endif
    return JS_NewString(ctx, PLATFORM);
}

// get nanoseconds timestamp. note: this timestamp is a relative value, and has nothing to do with specific calendar
static JSValue hrtime(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    LARGE_INTEGER freq, counter;
    QueryPerformanceFrequency(&freq);  
    QueryPerformanceCounter(&counter);  

    int64_t nanosec = (int64_t)((counter.QuadPart * 1000000000ULL) / freq.QuadPart);

    return JS_NewInt64(ctx, nanosec);
}

// get current working directory
static JSValue cwd(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    DWORD size = GetCurrentDirectoryW(0, NULL);
    if (size == 0) {
        return JS_ThrowInternalError(ctx, "GetCurrentDirectoryW failed (size=0)");
    }

    wchar_t *wbuf = (wchar_t *)js_malloc(ctx, size * sizeof(wchar_t));
    if (!wbuf) {
        return JS_ThrowOutOfMemory(ctx);
    }

    DWORD ret = GetCurrentDirectoryW(size, wbuf);
    if (ret == 0 || ret >= size) {
        js_free(ctx, wbuf);
        return JS_ThrowInternalError(ctx, "GetCurrentDirectoryW failed");
    }

    int utf8_size = WideCharToMultiByte(CP_UTF8, 0, wbuf, -1, NULL, 0, NULL, NULL);
    if (utf8_size == 0) {
        js_free(ctx, wbuf);
        return JS_ThrowInternalError(ctx, "WideCharToMultiByte failed (size=0)");
    }

    char *utf8_buf = (char *)js_malloc(ctx, utf8_size);
    if (!utf8_buf) {
        js_free(ctx, wbuf);
        return JS_ThrowOutOfMemory(ctx);
    }

    if (WideCharToMultiByte(CP_UTF8, 0, wbuf, -1, utf8_buf, utf8_size, NULL, NULL) == 0) {
        js_free(ctx, wbuf);
        js_free(ctx, utf8_buf);
        return JS_ThrowInternalError(ctx, "WideCharToMultiByte failed");
    }

    JSValue result = JS_NewString(ctx, utf8_buf);

    js_free(ctx, wbuf);
    js_free(ctx, utf8_buf);

    return result;
}

// get the path of runtime executable
static JSValue execPath(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    DWORD size = MAX_PATH;
    wchar_t *wbuf = NULL;

    while (1) {
        wbuf = (wchar_t *)js_realloc(ctx, wbuf, size * sizeof(wchar_t));
        if (!wbuf) {
            return JS_ThrowOutOfMemory(ctx);
        }

        DWORD ret = GetModuleFileNameW(NULL, wbuf, size);
        if (ret == 0) {
            js_free(ctx, wbuf);
            return JS_ThrowInternalError(ctx, "GetModuleFileNameW failed");
        }

        if (ret < size) {
            break; 
        }

        size *= 2;
    }

    int utf8_size = WideCharToMultiByte(CP_UTF8, 0, wbuf, -1, NULL, 0, NULL, NULL);
    if (utf8_size == 0) {
        js_free(ctx, wbuf);
        return JS_ThrowInternalError(ctx, "WideCharToMultiByte failed (size=0)");
    }

    char *utf8_buf = (char *)js_malloc(ctx, utf8_size);
    if (!utf8_buf) {
        js_free(ctx, wbuf);
        return JS_ThrowOutOfMemory(ctx);
    }

    if (WideCharToMultiByte(CP_UTF8, 0, wbuf, -1, utf8_buf, utf8_size, NULL, NULL) == 0) {
        js_free(ctx, wbuf);
        js_free(ctx, utf8_buf);
        return JS_ThrowInternalError(ctx, "WideCharToMultiByte failed");
    }

    JSValue result = JS_NewString(ctx, utf8_buf);

    js_free(ctx, wbuf);
    js_free(ctx, utf8_buf);

    return result;
}

// get the title of current process
static JSValue title(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue path = execPath(ctx, this_val, argc, argv);
    if (JS_IsException(path)) {
        return path; 
    }

    const char *utf8_path = JS_ToCString(ctx, path);
    if (!utf8_path) {
        JS_FreeValue(ctx, path);
        return JS_ThrowInternalError(ctx, "JS_ToCString failed");
    }

    const char *last_slash = strrchr(utf8_path, '\\');
    if (!last_slash) {
        last_slash = strrchr(utf8_path, '/');
    }

    const char *filename = last_slash ? last_slash + 1 : utf8_path;

    JSValue result = JS_NewString(ctx, filename);

    JS_FreeCString(ctx, utf8_path);
    JS_FreeValue(ctx, path);

    return result;
}

// get the pid of current process
static JSValue pid(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    DWORD pid = GetCurrentProcessId();
    return JS_NewInt64(ctx, pid);
}

// get the pid of parent process
static DWORD GetParentPID(DWORD pid) {
    DWORD ppid = 0;
    HANDLE hSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    
    if (hSnapshot != INVALID_HANDLE_VALUE) {
        PROCESSENTRY32 pe32;
        pe32.dwSize = sizeof(PROCESSENTRY32);
        
        if (Process32First(hSnapshot, &pe32)) {
            do {
                if (pe32.th32ProcessID == pid) {
                    ppid = pe32.th32ParentProcessID;
                    break;
                }
            } while (Process32Next(hSnapshot, &pe32));
        }
        CloseHandle(hSnapshot);
    }
    return ppid;
}
static JSValue ppid(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    DWORD pid = GetCurrentProcessId();
    DWORD ppid = GetParentPID(pid);
    return JS_NewInt64(ctx, ppid);
}

// get environs as k-v object
static JSValue env(JSContext *ctx) {
    wchar_t *env_block = GetEnvironmentStringsW();
    if (!env_block) {
        return JS_ThrowInternalError(ctx, "GetEnvironmentStringsW failed");
    }

    JSValue env_obj = JS_NewObject(ctx);

    wchar_t *current = env_block;
    while (*current != L'\0') {
        wchar_t *equal_pos = wcschr(current, L'=');
        if (!equal_pos) {
            current += wcslen(current) + 1;
            continue;
        }

        size_t key_len = equal_pos - current;
        wchar_t *value = equal_pos + 1;

        char key_utf8[256], value_utf8[4096];
        WideCharToMultiByte(CP_UTF8, 0, current, key_len, key_utf8, sizeof(key_utf8), NULL, NULL);
        WideCharToMultiByte(CP_UTF8, 0, value, -1, value_utf8, sizeof(value_utf8), NULL, NULL);

        JS_SetPropertyStr(ctx, env_obj, key_utf8, JS_NewString(ctx, value_utf8));

        current += wcslen(current) + 1;
    }

    FreeEnvironmentStringsW(env_block);

    return env_obj;
}

// graceful exit. TODO: improve cleanup procedure
static JSValue js_exit(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int exit_code = 0;
    
    if (argc > 0) {
        if (JS_ToInt32(ctx, &exit_code, argv[0])) {
            return JS_ThrowTypeError(ctx, "Exit code must be an integer");
        }
    }

    JSRuntime *rt = JS_GetRuntime(ctx);

    JS_FreeContext(ctx);        
    js_std_free_handlers(rt);     
    JS_FreeRuntime(rt);      

    fflush(NULL);       
    exit(exit_code);   
    
    return JS_UNDEFINED;
}

// exit without cleanup
static JSValue reallyExit(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int exit_code = 0;
    if (argc > 0) JS_ToInt32(ctx, &exit_code, argv[0]); 
    
    exit(exit_code); 
    return JS_UNDEFINED;
}

// boom~ abrupt exit
static JSValue js_abort(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    (void)ctx; (void)this_val; (void)argc; (void)argv;
    abort();
    return JS_UNDEFINED;
}

// stdout
static JSValue js_stdout(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc == 0) return JS_UNDEFINED;

    const char* payload = JS_ToCString(ctx, argv[0]);
    if (!payload) return JS_ThrowInternalError(ctx, "failed to get string");

    wchar_t* wpayload = utf8_to_wchar(payload);
    JS_FreeCString(ctx, payload); 

    if (!wpayload) return JS_ThrowInternalError(ctx, "failed to convert utf8 to wchar");

    int old_mode = _setmode(_fileno(stdout), _O_U16TEXT); 
    if( old_mode == -1) return JS_ThrowInternalError(ctx, "failed to set stdout mode");
    wprintf(L"%s", wpayload);
    _setmode(_fileno(stdout), old_mode);    

    free(wpayload);
    return JS_UNDEFINED;
}

// stderr
static JSValue js_stderr(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    if (argc == 0) return JS_UNDEFINED;

    const char* payload = JS_ToCString(ctx, argv[0]);
    if (!payload) return JS_ThrowInternalError(ctx, "failed to get string");

    wchar_t* wpayload = utf8_to_wchar(payload);
    JS_FreeCString(ctx, payload);

    if (!wpayload) return JS_ThrowInternalError(ctx, "failed to convert utf8 to wchar");

    int old_mode = _setmode(_fileno(stderr), _O_U16TEXT); 
    if( old_mode == -1) return JS_ThrowInternalError(ctx, "failed to set stderr mode");
    fwprintf(stderr, L"%s", wpayload);
    _setmode(_fileno(stderr), old_mode);

    free(wpayload);
    return JS_UNDEFINED;
}

// umask: if argv[0] is provided, alter umask and return old value. otherwise return current umask
// why isn't it working on windows(always return 0)? need further investigation
static JSValue js_umask(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int new_mask = -1; 

    if (argc >= 1) {
        uint32_t mask;
        if (JS_ToUint32(ctx, &mask, argv[0]) != 0) {
            return JS_ThrowTypeError(ctx, "umask must be an octal number (e.g. 0o22)");
        }
        new_mask = (int)mask;
    }

    int old_mask;
    old_mask = _umask(new_mask);
    if (new_mask == -1) _umask(old_mask); 

    return JS_NewUint32(ctx, (uint32_t)old_mask);
}

// argv: get argv as a js array
static JSValue js_argv(JSContext *ctx) {
    JSValue js_array = JS_NewArray(ctx);
    if (JS_IsException(js_array)) {
        return JS_EXCEPTION;
    }

    for (int i = 0; i < p_argc; i++) {
        JSValue js_arg = JS_NewString(ctx, p_argv[i]);
        if (JS_IsException(js_arg)) {
            JS_FreeValue(ctx, js_array);
            return JS_EXCEPTION;
        }
        JS_SetPropertyUint32(ctx, js_array, i, js_arg);
    }

    return js_array;
}

// kill
static JSValue js_kill(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int pid;
    int signal = 9; 

    if (argc < 1) {
        return JS_ThrowTypeError(ctx, "pid is required");
    }
    if (JS_ToInt32(ctx, &pid, argv[0]) != 0) {
        return JS_ThrowTypeError(ctx, "pid must be an integer");
    }
    if (argc >= 2 && JS_ToInt32(ctx, &signal, argv[1]) != 0) {
        return JS_ThrowTypeError(ctx, "signal must be an integer");
    }

    // if sig=0, simply check the process
    if (signal == 0) {
        HANDLE hProcess = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, (DWORD)pid);
        if (!hProcess) {
            DWORD err = GetLastError();
            const char* msg = (err == ERROR_INVALID_PARAMETER) ? "Process does not exist" : "No permission";
            return JS_ThrowInternalError(ctx, "%s (error %lu)", msg, err);
        }
        CloseHandle(hProcess);
        return JS_UNDEFINED; 
    }

    // if is any non-zero signal on windows, kill the process
    HANDLE hProcess = OpenProcess(PROCESS_TERMINATE, FALSE, (DWORD)pid);
    if (!hProcess) {
        DWORD err = GetLastError();
        return JS_ThrowInternalError(ctx, "OpenProcess failed (error %lu)", err);
    }

    BOOL success = TerminateProcess(hProcess, 1);
    CloseHandle(hProcess);

    if (!success) {
        return JS_ThrowInternalError(ctx, "TerminateProcess failed (error %lu)", GetLastError());
    }

    return JS_UNDEFINED;
}

// endianness. 1234 if LE, 4321 if BE
static JSValue endianness(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    int num = 1;
    char *ptr = (char *)&num;
    return JS_NewInt32(ctx, ((*ptr == 1) ? 1234 : 4321));
}

// freemem
static JSValue freemem(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    MEMORYSTATUSEX memInfo;
    memInfo.dwLength = sizeof(memInfo);
    if (!GlobalMemoryStatusEx(&memInfo)) {
        return JS_ThrowInternalError(ctx, "GlobalMemoryStatusEx failed");
    }
    return JS_NewInt64(ctx, memInfo.ullAvailPhys); 
}

// homedir
static JSValue homedir(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    wchar_t wpath[MAX_PATH];

    if (FAILED(SHGetFolderPathW(NULL, CSIDL_PROFILE, NULL, 0, wpath))) {
        return JS_ThrowInternalError(ctx, "Failed to get home directory");
    }

    char *utf8_path = wstr_to_utf8(ctx, wpath);
    if (!utf8_path) {
        return JS_ThrowInternalError(ctx, "Failed to convert path to UTF-8");
    }

    JSValue result = JS_NewString(ctx, utf8_path);
    js_free(ctx, utf8_path);  
    return result;
}

// hostname
static JSValue hostname(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    wchar_t wname[MAX_COMPUTERNAME_LENGTH + 1];
    DWORD size = sizeof(wname) / sizeof(wname[0]);

    if (!GetComputerNameExW(ComputerNameDnsHostname, wname, &size)) {
        return JS_ThrowInternalError(ctx, "Failed to get hostname");
    }

    char *utf8_name = wstr_to_utf8(ctx, wname);
    if (!utf8_name) {
        return JS_ThrowInternalError(ctx, "Failed to convert hostname to UTF-8");
    }

    JSValue result = JS_NewString(ctx, utf8_name);
    js_free(ctx, utf8_name); 
    return result;
}

// osRelease
static JSValue osRelease(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    typedef LONG (WINAPI *RtlGetVersionFunc)(PRTL_OSVERSIONINFOW);
    RtlGetVersionFunc pRtlGetVersion = (RtlGetVersionFunc)GetProcAddress(
        GetModuleHandleW(L"ntdll.dll"), "RtlGetVersion"
    );

    RTL_OSVERSIONINFOW versionInfo = {0};
    versionInfo.dwOSVersionInfoSize = sizeof(versionInfo);

    if (pRtlGetVersion && pRtlGetVersion(&versionInfo) == 0) {
        wchar_t wversion[64];
        swprintf(wversion, sizeof(wversion) / sizeof(wversion[0]),
                L"%lu.%lu.%lu",
                versionInfo.dwMajorVersion,
                versionInfo.dwMinorVersion,
                versionInfo.dwBuildNumber);

        char *utf8_version = wstr_to_utf8(ctx, wversion);
        if (!utf8_version) {
            return JS_ThrowInternalError(ctx, "Failed to convert version to UTF-8");
        }

        JSValue result = JS_NewString(ctx, utf8_version);
        js_free(ctx, utf8_version);
        return result;
    }

    // fallback to GetVersionExW (might be inaccurate)
    OSVERSIONINFOW osvi = {0};
    osvi.dwOSVersionInfoSize = sizeof(osvi);
    if (GetVersionExW(&osvi)) {
        wchar_t wversion[64];
        swprintf(wversion, sizeof(wversion) / sizeof(wversion[0]),
                L"%lu.%lu.%lu",
                osvi.dwMajorVersion,
                osvi.dwMinorVersion,
                osvi.dwBuildNumber);

        char *utf8_version = wstr_to_utf8(ctx, wversion);
        if (!utf8_version) {
            return JS_ThrowInternalError(ctx, "Failed to convert version to UTF-8");
        }

        JSValue result = JS_NewString(ctx, utf8_version);
        js_free(ctx, utf8_version);
        return result;
    }

    return JS_ThrowInternalError(ctx, "Failed to get OS version");
}

// tmpdir
static JSValue tmpdir(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    // not required on Windows
    return JS_UNDEFINED;
}

// totalmem
static JSValue totalmem(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    MEMORYSTATUSEX memInfo;
    memInfo.dwLength = sizeof(memInfo);

    if (!GlobalMemoryStatusEx(&memInfo)) {
        return JS_ThrowInternalError(ctx, "Failed to get total memory");
    }

    return JS_NewInt64(ctx, memInfo.ullTotalPhys);
}

// uptime
static JSValue uptime(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_NewInt64(ctx, GetTickCount64());
}

// osType
static JSValue osType(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    // fixed for win32
    return JS_NewString(ctx, "Windows_NT");
}

// osVersion
static JSValue osVersion(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    wchar_t product_name[64] = L"";
    HKEY hKey;
    if (RegOpenKeyExW(HKEY_LOCAL_MACHINE, L"SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion", 
                      0, KEY_READ, &hKey) == ERROR_SUCCESS) {
        DWORD size = sizeof(product_name);
        RegQueryValueExW(hKey, L"ProductName", NULL, NULL, 
                        (LPBYTE)product_name, &size);
        RegCloseKey(hKey);
    }

    char *utf8_version = wstr_to_utf8(ctx, product_name);
    if (!utf8_version) {
        return JS_ThrowInternalError(ctx, "Failed to convert version to UTF-8");
    }

    JSValue result = JS_NewString(ctx, utf8_version);
    js_free(ctx, utf8_version);
    return result;
}

// osMachine
static JSValue osMachine(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    SYSTEM_INFO sysInfo;
    GetNativeSystemInfo(&sysInfo);

    const wchar_t *arch;
    switch (sysInfo.wProcessorArchitecture) {  
        case PROCESSOR_ARCHITECTURE_AMD64:
            arch = L"x86_64";
            break;
        case PROCESSOR_ARCHITECTURE_ARM64:
            arch = L"arm64";
            break;
        case PROCESSOR_ARCHITECTURE_INTEL:
            arch = L"x86";
            break;
        case PROCESSOR_ARCHITECTURE_ARM:
            arch = L"arm";
            break;
        default:
            arch = L"unknown";
    }

    char *utf8_arch = wstr_to_utf8(ctx, arch);
    if (!utf8_arch) {
        return JS_ThrowInternalError(ctx, "Failed to convert architecture to UTF-8");
    }

    JSValue result = JS_NewString(ctx, utf8_arch);
    js_free(ctx, utf8_arch);
    return result;
}

// uid
static JSValue uid(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    // on windows
    return JS_NewUint32(ctx, 0xFFFFFFFF);
}

// gid
static JSValue gid(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    // on windows
    return JS_NewUint32(ctx, 0xFFFFFFFF);
}

// username
static JSValue username(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    wchar_t username[UNLEN + 1]; 
    DWORD size = UNLEN + 1;

    if (!GetUserNameW(username, &size)) {
        return JS_ThrowInternalError(ctx, "Failed to get username");
    }

    char *utf8_username = wstr_to_utf8(ctx, username);
    if (!utf8_username) {
        return JS_ThrowInternalError(ctx, "Failed to convert username to UTF-8");
    }

    JSValue result = JS_NewString(ctx, utf8_username);
    js_free(ctx, utf8_username);
    return result;
}

// shell: get current shell name
static JSValue shell(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    // on windows
    return JS_UNDEFINED;
}

// osConstants
static JSValue osConstants(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv){
    JSValue dlopen = JS_NewObject(ctx);

    JSValue errnum = JS_NewObject(ctx);
    #define C(name) JS_SetPropertyStr(ctx, errnum, #name, JS_NewInt64(ctx, name))
    C(E2BIG); C(EACCES); C(EADDRINUSE); C(EADDRNOTAVAIL); C(EAFNOSUPPORT); C(EAGAIN); C(EALREADY); 
    C(EBADF); C(EBADMSG); C(EBUSY); C(ECANCELED); C(ECHILD); C(ECONNABORTED); C(ECONNREFUSED); 
    C(ECONNRESET); C(EDEADLK); C(EDESTADDRREQ); C(EDOM); C(EEXIST); C(EFAULT); C(EFBIG); C(EHOSTUNREACH); 
    C(EIDRM); C(EILSEQ); C(EINPROGRESS); C(EINTR); C(EINVAL); C(EIO); C(EISCONN); C(EISDIR); C(ELOOP); 
    C(EMFILE); C(EMLINK); C(EMSGSIZE); C(ENAMETOOLONG); C(ENETDOWN); C(ENETRESET); C(ENETUNREACH); 
    C(ENFILE); C(ENOBUFS); C(ENODATA); C(ENODEV); C(ENOENT); C(ENOEXEC); C(ENOLCK); C(ENOLINK); C(ENOMEM); 
    C(ENOMSG); C(ENOPROTOOPT); C(ENOSPC); C(ENOSR); C(ENOSTR); C(ENOSYS); C(ENOTCONN); C(ENOTDIR); 
    C(ENOTEMPTY); C(ENOTSOCK); C(ENOTSUP); C(ENOTTY); C(ENXIO); C(EOPNOTSUPP); C(EOVERFLOW); C(EPERM); 
    C(EPIPE); C(EPROTO); C(EPROTONOSUPPORT); C(EPROTOTYPE); C(ERANGE); C(EROFS); C(ESPIPE); C(ESRCH); 
    C(ETIME); C(ETIMEDOUT); C(ETXTBSY); C(EWOULDBLOCK); C(EXDEV); C(WSAEINTR); C(WSAEBADF); C(WSAEACCES); 
    C(WSAEFAULT); C(WSAEINVAL); C(WSAEMFILE); C(WSAEWOULDBLOCK); C(WSAEINPROGRESS); C(WSAEALREADY); 
    C(WSAENOTSOCK); C(WSAEDESTADDRREQ); C(WSAEMSGSIZE); C(WSAEPROTOTYPE); C(WSAENOPROTOOPT); C(WSAEPROTONOSUPPORT); 
    C(WSAESOCKTNOSUPPORT); C(WSAEOPNOTSUPP); C(WSAEPFNOSUPPORT); C(WSAEAFNOSUPPORT); C(WSAEADDRINUSE); 
    C(WSAEADDRNOTAVAIL); C(WSAENETDOWN); C(WSAENETUNREACH); C(WSAENETRESET); C(WSAECONNABORTED); 
    C(WSAECONNRESET); C(WSAENOBUFS); C(WSAEISCONN); C(WSAENOTCONN); C(WSAESHUTDOWN); C(WSAETOOMANYREFS); 
    C(WSAETIMEDOUT); C(WSAECONNREFUSED); C(WSAELOOP); C(WSAENAMETOOLONG); C(WSAEHOSTDOWN); C(WSAEHOSTUNREACH); 
    C(WSAENOTEMPTY); C(WSAEPROCLIM); C(WSAEUSERS); C(WSAEDQUOT); C(WSAESTALE); C(WSAEREMOTE); 
    C(WSASYSNOTREADY); C(WSAVERNOTSUPPORTED); C(WSANOTINITIALISED); C(WSAEDISCON); C(WSAENOMORE); 
    C(WSAECANCELLED); C(WSAEINVALIDPROCTABLE); C(WSAEINVALIDPROVIDER); C(WSAEPROVIDERFAILEDINIT); 
    C(WSASYSCALLFAILURE); C(WSASERVICE_NOT_FOUND); C(WSATYPE_NOT_FOUND); C(WSA_E_NO_MORE); C(WSA_E_CANCELLED); C(WSAEREFUSED);

    JSValue signals = JS_NewObject(ctx);
    #define C(name) JS_SetPropertyStr(ctx, signals, #name, JS_NewInt64(ctx, name))
    #ifdef _WIN32
        #define SIGHUP 1
        #define SIGQUIT 3
        #define SIGKILL 9
        #define SIGWINCH 28
    #endif
    C(SIGHUP); C(SIGINT); C(SIGQUIT); C(SIGILL); C(SIGABRT); C(SIGFPE); C(SIGKILL); C(SIGSEGV); C(SIGTERM); C(SIGBREAK); C(SIGWINCH);

    JSValue priority = JS_NewObject(ctx);
    #define C(name) JS_SetPropertyStr(ctx, priority, #name, JS_NewInt64(ctx, name))
    #ifdef _WIN32
        #define PRIORITY_LOW          THREAD_PRIORITY_LOWEST
        #define PRIORITY_BELOW_NORMAL THREAD_PRIORITY_BELOW_NORMAL
        #define PRIORITY_NORMAL       THREAD_PRIORITY_NORMAL
        #define PRIORITY_ABOVE_NORMAL THREAD_PRIORITY_ABOVE_NORMAL
        #define PRIORITY_HIGH         THREAD_PRIORITY_HIGHEST
        #define PRIORITY_REALTIME     THREAD_PRIORITY_TIME_CRITICAL
    #endif
    C(PRIORITY_LOW); C(PRIORITY_BELOW_NORMAL); C(PRIORITY_NORMAL); C(PRIORITY_ABOVE_NORMAL); C(PRIORITY_HIGH); C(PRIORITY_REALTIME);

    JSValue constants = JS_NewObject(ctx);
    JS_SetPropertyStr(ctx, constants, "dlopen", dlopen);
    JS_SetPropertyStr(ctx, constants, "errno", errnum);
    JS_SetPropertyStr(ctx, constants, "signals", signals);
    JS_SetPropertyStr(ctx, constants, "priority", priority);

    return constants;

    #undef C
}

// fsConstants
static JSValue fsConstants(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue constants = JS_NewObject(ctx);
    #define C(name) JS_SetPropertyStr(ctx, constants, #name, JS_NewInt32(ctx, name));
    #ifdef _WIN32
        #define O_RDONLY   _O_RDONLY
        #define O_WRONLY   _O_WRONLY
        #define O_RDWR     _O_RDWR
        #define O_CREAT    _O_CREAT
        #define O_EXCL     _O_EXCL
        #define O_TRUNC    _O_TRUNC
        #define O_APPEND   _O_APPEND

        #define S_IFMT     _S_IFMT
        #define S_IFREG    _S_IFREG
        #define S_IFDIR    _S_IFDIR
        #define S_IFCHR    _S_IFCHR
        #define S_IFIFO    _S_IFIFO
        #define S_IFLNK    0xA000
        #define S_IRUSR    _S_IREAD
        #define S_IWUSR    _S_IWRITE

        #define F_OK 0  // aligned with `_access` mode flags in msvc <io.h>
        #define R_OK 4
        #define W_OK 2
        #define X_OK 1
    #endif
    #define UV_FS_SYMLINK_DIR            1    // `UV_*` constants will be defined as the same code 
    #define UV_FS_SYMLINK_JUNCTION       2    // in libuv, in case someone use hardcoded values in 
    #define UV_DIRENT_UNKNOWN            0    // their js code
    #define UV_DIRENT_FILE               1
    #define UV_DIRENT_DIR                2
    #define UV_DIRENT_LINK               3
    #define UV_DIRENT_FIFO               4
    #define UV_DIRENT_SOCKET             5
    #define UV_DIRENT_CHAR               6
    #define UV_DIRENT_BLOCK              7
    #define UV_FS_O_FILEMAP              0x20000000
    #define UV_FS_COPYFILE_EXCL          1
    #define UV_FS_COPYFILE_FICLONE       2
    #define UV_FS_COPYFILE_FICLONE_FORCE 4
    #define COPYFILE_EXCL                UV_FS_COPYFILE_EXCL
    #define COPYFILE_FICLONE             UV_FS_COPYFILE_FICLONE
    #define COPYFILE_FICLONE_FORCE       UV_FS_COPYFILE_FICLONE_FORCE
    C(O_RDONLY); C(O_WRONLY); C(O_RDWR); C(O_CREAT); C(O_EXCL); C(O_TRUNC); C(O_APPEND);
    C(S_IFMT); C(S_IFREG); C(S_IFDIR); C(S_IFCHR); C(S_IFIFO); C(S_IFLNK); C(S_IRUSR); C(S_IWUSR);
    C(F_OK); C(R_OK); C(W_OK); C(X_OK);
    C(UV_FS_SYMLINK_DIR); C(UV_FS_SYMLINK_JUNCTION);
    C(UV_DIRENT_UNKNOWN); C(UV_DIRENT_FILE); C(UV_DIRENT_DIR); C(UV_DIRENT_LINK); C(UV_DIRENT_FIFO);
    C(UV_DIRENT_SOCKET); C(UV_DIRENT_CHAR); C(UV_DIRENT_BLOCK);
    C(UV_FS_O_FILEMAP);
    C(UV_FS_COPYFILE_EXCL); C(UV_FS_COPYFILE_FICLONE); C(UV_FS_COPYFILE_FICLONE_FORCE);
    C(COPYFILE_EXCL); C(COPYFILE_FICLONE); C(COPYFILE_FICLONE_FORCE);

    return constants;

    #undef C
}

// isExternal: check if an object is v8 external object. currently it's always false
static JSValue isExternal(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_FALSE;
}

// isProxy
static JSValue isProxy(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_IsProxy(argv[0]) ? JS_TRUE : JS_FALSE;
}

// isModuleNamespaceObject
static JSValue isModuleNamespaceObject(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_FALSE;
}

// getProxyTarget
static JSValue getProxyTarget(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_GetProxyTarget(ctx, argv[0]);
}

// getProxyHandler
static JSValue getProxyHandler(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_GetProxyHandler(ctx, argv[0]);
}

// getPromiseState
static JSValue getPromiseState(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSPromiseStateEnum state = JS_PromiseState(ctx, argv[0]);
    if(state==JS_PROMISE_PENDING)
        return JS_NewInt32(ctx, 0);
    else if(state==JS_PROMISE_FULFILLED)
        return JS_NewInt32(ctx, 1);
    else if(state==JS_PROMISE_REJECTED)
        return JS_NewInt32(ctx, 2);
}

// getPromiseResult
static JSValue getPromiseResult(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    return JS_PromiseResult(ctx, argv[0]);
}

// sleep
static JSValue js_sleep(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    DWORD ms; JS_ToInt64(ctx, &ms, argv[0]);
    Sleep(ms);
    return JS_UNDEFINED;
}


static const JSCFunctionListEntry bindings_funcs[] = {
    JS_CFUNC_DEF("arch", 0, arch),
    JS_CFUNC_DEF("platform", 0, platform),
    JS_CFUNC_DEF("hrtime", 0, hrtime),
    JS_CFUNC_DEF("cwd", 0, cwd),
    JS_CFUNC_DEF("execPath", 0, execPath),
    JS_CFUNC_DEF("title", 0, title),
    JS_CFUNC_DEF("pid", 0, pid),
    JS_CFUNC_DEF("ppid", 0, ppid),
    JS_CFUNC_DEF("env", 0, env),
    JS_CFUNC_DEF("exit", 0, js_exit),
    JS_CFUNC_DEF("reallyExit", 0, reallyExit),
    JS_CFUNC_DEF("abort", 0, js_abort),
    JS_CFUNC_DEF("stdout", 0, js_stdout),
    JS_CFUNC_DEF("stderr", 0, js_stderr),
    JS_CFUNC_DEF("umask", 0, js_umask),
    JS_CFUNC_DEF("argv", 0, js_argv),
    JS_CFUNC_DEF("kill", 0, js_kill),
    JS_CFUNC_DEF("endianness", 0, endianness),
    JS_CFUNC_DEF("freemem", 0, freemem),
    JS_CFUNC_DEF("homedir", 0, homedir),
    JS_CFUNC_DEF("hostname", 0, hostname),
    JS_CFUNC_DEF("osRelease", 0, osRelease),
    JS_CFUNC_DEF("tmpdir", 0, tmpdir),
    JS_CFUNC_DEF("totalmem", 0, totalmem),
    JS_CFUNC_DEF("uptime", 0, uptime),
    JS_CFUNC_DEF("osType", 0, osType),
    JS_CFUNC_DEF("osVersion", 0, osVersion),
    JS_CFUNC_DEF("osMachine", 0, osMachine),
    JS_CFUNC_DEF("uid", 0, uid),
    JS_CFUNC_DEF("gid", 0, gid),
    JS_CFUNC_DEF("username", 0, username),
    JS_CFUNC_DEF("shell", 0, shell),
    JS_CFUNC_DEF("osConstants", 0, osConstants),
    JS_CFUNC_DEF("fsConstants", 0, fsConstants),
    JS_CFUNC_DEF("isExternal", 0, isExternal),
    JS_CFUNC_DEF("isProxy", 0, isProxy),
    JS_CFUNC_DEF("isModuleNamespaceObject", 0, isModuleNamespaceObject),
    JS_CFUNC_DEF("getProxyTarget", 0, getProxyTarget),
    JS_CFUNC_DEF("getProxyHandler", 0, getProxyHandler),
    JS_CFUNC_DEF("getPromiseState", 0, getPromiseState),
    JS_CFUNC_DEF("getPromiseResult", 0, getPromiseResult),
    JS_CFUNC_DEF("sleep", 0, js_sleep),
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