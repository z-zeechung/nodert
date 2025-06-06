
CC = cl
CFLAGS = /MT -Iquickjs -Iuv/include -Isrc /std:c11 /Os /O1

LINK = link
LDFLAGS = /NODEFAULTLIB:api-ms-win-crt-*.lib /NODEFAULTLIB:ucrt.lib ucrt.lib vcruntime.lib kernel32.lib libcmt.lib libvcruntime.lib Shell32.lib Advapi32.lib ntdll.lib wbemuuid.lib /NODEFAULTLIB:MSVCRT /NODEFAULTLIB:libucrt.lib ws2_32.lib iphlpapi.lib userenv.lib psapi.lib dbghelp.lib user32.lib ole32.lib

RC = rc
RFLAGS = /utf-8 /n

all: nodert.exe

nodert.exe: bindings.obj timers.obj nodert.obj qjs-libc.obj resource.res
	$(LINK) src/bindings.obj src/timers.obj src/nodert.obj libqjs/Release/qjs.lib libuv/Release/libuv.lib src/qjs-libc.obj src/resource.res $(LDFLAGS) /OUT:nodert.exe

nodert.obj:
	$(CC) src/nodert.c $(CFLAGS) /c /Fo:src/nodert.obj

qjs-libc.obj:
	$(CC) quickjs/quickjs-libc.c $(CFLAGS) /experimental:c11atomics /c /Fo:src/qjs-libc.obj

bindings.obj:
	$(CC) src/bindings.c $(CFLAGS) /c /Fo:src/bindings.obj

timers.obj:
	$(CC) src/timers.c $(CFLAGS) /c /Fo:src/timers.obj

resource.res:
	$(RC) $(RFLAGS) /fo "src/resource.res" "src/resource.rc"

clean:
	del /Q nodert.exe src\*.obj src\*.res