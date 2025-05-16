#include "bindings.h"

#include <winsock2.h>  
#include <ws2tcpip.h>  
#include <signal.h> 

#define countof(arr) (sizeof(arr) / sizeof(*arr))

#define BIND_OBJECT(PARENT, NAME) JSValue obj_##NAME = JS_NewObject(ctx); JS_SetPropertyStr(ctx, obj_##PARENT, #NAME, obj_##NAME);

#define BIND_VALUE(PARENT, MARCO) JS_SetPropertyStr(ctx, obj_##PARENT, #MARCO, JS_NewInt32(ctx, MARCO));

static JSValue os(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
    JSValue obj_os = JS_NewObject(ctx);
    BIND_OBJECT(os, dlopen);
    BIND_OBJECT(os, errno);
        BIND_VALUE(errno, E2BIG);
        BIND_VALUE(errno, EACCES);
        BIND_VALUE(errno, EADDRINUSE);
        BIND_VALUE(errno, EADDRNOTAVAIL);
        BIND_VALUE(errno, EAFNOSUPPORT);
        BIND_VALUE(errno, EAGAIN);
        BIND_VALUE(errno, EALREADY);
        BIND_VALUE(errno, EBADF);
        BIND_VALUE(errno, EBADMSG);
        BIND_VALUE(errno, EBUSY);
        BIND_VALUE(errno, ECANCELED);
        BIND_VALUE(errno, ECHILD);
        BIND_VALUE(errno, ECONNABORTED);
        BIND_VALUE(errno, ECONNREFUSED);
        BIND_VALUE(errno, ECONNRESET);
        BIND_VALUE(errno, EDEADLK);
        BIND_VALUE(errno, EDESTADDRREQ);
        BIND_VALUE(errno, EDOM);
        BIND_VALUE(errno, EEXIST);
        BIND_VALUE(errno, EFAULT);
        BIND_VALUE(errno, EFBIG);
        BIND_VALUE(errno, EHOSTUNREACH);
        BIND_VALUE(errno, EIDRM);
        BIND_VALUE(errno, EILSEQ);
        BIND_VALUE(errno, EINPROGRESS);
        BIND_VALUE(errno, EINTR);
        BIND_VALUE(errno, EINVAL);
        BIND_VALUE(errno, EIO);
        BIND_VALUE(errno, EISCONN);
        BIND_VALUE(errno, EISDIR);
        BIND_VALUE(errno, ELOOP);
        BIND_VALUE(errno, EMFILE);
        BIND_VALUE(errno, EMLINK);
        BIND_VALUE(errno, EMSGSIZE);
        BIND_VALUE(errno, ENAMETOOLONG);
        BIND_VALUE(errno, ENETDOWN);
        BIND_VALUE(errno, ENETRESET);
        BIND_VALUE(errno, ENETUNREACH);
        BIND_VALUE(errno, ENFILE);
        BIND_VALUE(errno, ENOBUFS);
        BIND_VALUE(errno, ENODATA);
        BIND_VALUE(errno, ENODEV);
        BIND_VALUE(errno, ENOENT);
        BIND_VALUE(errno, ENOEXEC);
        BIND_VALUE(errno, ENOLCK);
        BIND_VALUE(errno, ENOLINK);
        BIND_VALUE(errno, ENOMEM);
        BIND_VALUE(errno, ENOMSG);
        BIND_VALUE(errno, ENOPROTOOPT);
        BIND_VALUE(errno, ENOSPC);
        BIND_VALUE(errno, ENOSR);
        BIND_VALUE(errno, ENOSTR);
        BIND_VALUE(errno, ENOSYS);
        BIND_VALUE(errno, ENOTCONN);
        BIND_VALUE(errno, ENOTDIR);
        BIND_VALUE(errno, ENOTEMPTY);
        BIND_VALUE(errno, ENOTSOCK);
        BIND_VALUE(errno, ENOTSUP);
        BIND_VALUE(errno, ENOTTY);
        BIND_VALUE(errno, ENXIO);
        BIND_VALUE(errno, EOPNOTSUPP);
        BIND_VALUE(errno, EOVERFLOW);
        BIND_VALUE(errno, EPERM);
        BIND_VALUE(errno, EPIPE);
        BIND_VALUE(errno, EPROTO);
        BIND_VALUE(errno, EPROTONOSUPPORT);
        BIND_VALUE(errno, EPROTOTYPE);
        BIND_VALUE(errno, ERANGE);
        BIND_VALUE(errno, EROFS);
        BIND_VALUE(errno, ESPIPE);
        BIND_VALUE(errno, ESRCH);
        BIND_VALUE(errno, ETIME);
        BIND_VALUE(errno, ETIMEDOUT);
        BIND_VALUE(errno, ETXTBSY);
        BIND_VALUE(errno, EWOULDBLOCK);
        BIND_VALUE(errno, EXDEV);
        BIND_VALUE(errno, WSAEINTR);
        BIND_VALUE(errno, WSAEBADF);
        BIND_VALUE(errno, WSAEACCES);
        BIND_VALUE(errno, WSAEFAULT);
        BIND_VALUE(errno, WSAEINVAL);
        BIND_VALUE(errno, WSAEMFILE);
        BIND_VALUE(errno, WSAEWOULDBLOCK);
        BIND_VALUE(errno, WSAEINPROGRESS);
        BIND_VALUE(errno, WSAEALREADY);
        BIND_VALUE(errno, WSAENOTSOCK);
        BIND_VALUE(errno, WSAEDESTADDRREQ);
        BIND_VALUE(errno, WSAEMSGSIZE);
        BIND_VALUE(errno, WSAEPROTOTYPE);
        BIND_VALUE(errno, WSAENOPROTOOPT);
        BIND_VALUE(errno, WSAEPROTONOSUPPORT);
        BIND_VALUE(errno, WSAESOCKTNOSUPPORT);
        BIND_VALUE(errno, WSAEOPNOTSUPP);
        BIND_VALUE(errno, WSAEPFNOSUPPORT);
        BIND_VALUE(errno, WSAEAFNOSUPPORT);
        BIND_VALUE(errno, WSAEADDRINUSE);
        BIND_VALUE(errno, WSAEADDRNOTAVAIL);
        BIND_VALUE(errno, WSAENETDOWN);
        BIND_VALUE(errno, WSAENETUNREACH);
        BIND_VALUE(errno, WSAENETRESET);
        BIND_VALUE(errno, WSAECONNABORTED);
        BIND_VALUE(errno, WSAECONNRESET);
        BIND_VALUE(errno, WSAENOBUFS);
        BIND_VALUE(errno, WSAEISCONN);
        BIND_VALUE(errno, WSAENOTCONN);
        BIND_VALUE(errno, WSAESHUTDOWN);
        BIND_VALUE(errno, WSAETOOMANYREFS);
        BIND_VALUE(errno, WSAETIMEDOUT);
        BIND_VALUE(errno, WSAECONNREFUSED);
        BIND_VALUE(errno, WSAELOOP);
        BIND_VALUE(errno, WSAENAMETOOLONG);
        BIND_VALUE(errno, WSAEHOSTDOWN);
        BIND_VALUE(errno, WSAEHOSTUNREACH);
        BIND_VALUE(errno, WSAENOTEMPTY);
        BIND_VALUE(errno, WSAEPROCLIM);
        BIND_VALUE(errno, WSAEUSERS);
        BIND_VALUE(errno, WSAEDQUOT);
        BIND_VALUE(errno, WSAESTALE);
        BIND_VALUE(errno, WSAEREMOTE);
        BIND_VALUE(errno, WSASYSNOTREADY);
        BIND_VALUE(errno, WSAVERNOTSUPPORTED);
        BIND_VALUE(errno, WSANOTINITIALISED);
        BIND_VALUE(errno, WSAEDISCON);
        BIND_VALUE(errno, WSAENOMORE);
        BIND_VALUE(errno, WSAECANCELLED);
        BIND_VALUE(errno, WSAEINVALIDPROCTABLE);
        BIND_VALUE(errno, WSAEINVALIDPROVIDER);
        BIND_VALUE(errno, WSAEPROVIDERFAILEDINIT);
        BIND_VALUE(errno, WSASYSCALLFAILURE);
        BIND_VALUE(errno, WSASERVICE_NOT_FOUND);
        BIND_VALUE(errno, WSATYPE_NOT_FOUND);
        BIND_VALUE(errno, WSA_E_NO_MORE);
        BIND_VALUE(errno, WSA_E_CANCELLED);
        BIND_VALUE(errno, WSAEREFUSED);
    BIND_OBJECT(os, signals);
        // BIND_VALUE(signals, SIGHUP);
        BIND_VALUE(signals, SIGINT);
        // BIND_VALUE(signals, SIGQUIT);
        BIND_VALUE(signals, SIGILL);
        BIND_VALUE(signals, SIGABRT);
        BIND_VALUE(signals, SIGFPE);
        // BIND_VALUE(signals, SIGKILL);
        BIND_VALUE(signals, SIGSEGV);
        BIND_VALUE(signals, SIGTERM);
        BIND_VALUE(signals, SIGBREAK);
        // BIND_VALUE(signals, SIGWINCH);
    // BIND_OBJECT(os, priority);
    //     BIND_VALUE(priority, PRIORITY_LOW);
    //     BIND_VALUE(priority, PRIORITY_BELOW_NORMAL);
    //     BIND_VALUE(priority, PRIORITY_NORMAL);
    //     BIND_VALUE(priority, PRIORITY_ABOVE_NORMAL);
    //     BIND_VALUE(priority, PRIORITY_HIGH);
    //     BIND_VALUE(priority, PRIORITY_HIGHEST);
    // BIND_VALUE(os, UV_UDP_REUSEADDR);
    return obj_os;
}

static const JSCFunctionListEntry constants_funcs[] = {
    JS_CFUNC_DEF("os", 0, os),
};

static int constants_module_init(JSContext *ctx, JSModuleDef *m) {
    return JS_SetModuleExportList(ctx, m, constants_funcs, countof(constants_funcs));
}

JSModuleDef *js_init_binding_constants(JSContext *ctx, const char *module_name) {
    JSModuleDef *m = JS_NewCModule(ctx, module_name, constants_module_init);
    if (!m) return NULL;
    
    JS_AddModuleExportList(ctx, m, constants_funcs, countof(constants_funcs));
    
    return m;
}