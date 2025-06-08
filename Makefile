
CC = cl
CFLAGS = /MT -Iquickjs -Iuv/include -Isrc /std:c11 /Os /O1

CXX = cl
CXXFLAGS = /MT -Iquickjs -Iuv/include -Isrc -Iuvw/src /std:c++17 /Os /O1 /EHsc

LINK = link
LDFLAGS = /NODEFAULTLIB:api-ms-win-crt-*.lib /NODEFAULTLIB:ucrt.lib ucrt.lib kernel32.lib libcmt.lib libvcruntime.lib Shell32.lib Advapi32.lib ntdll.lib wbemuuid.lib /NODEFAULTLIB:MSVCRT /NODEFAULTLIB:libucrt.lib ws2_32.lib iphlpapi.lib userenv.lib psapi.lib dbghelp.lib user32.lib ole32.lib 

RC = rc
RFLAGS = /utf-8 /n

all: nodert.exe

# nodert.exe: bindings.obj nextTick.obj timers.obj fs.obj nodert.obj qjs-libc.obj resource.res
nodert.exe: bindings.obj nodert.obj qjs-libc.obj resource.res
# 	$(LINK) src/bindings.obj src/nextTick.obj src/timers.obj src/fs.obj src/nodert.obj libqjs/Release/qjs.lib libuv/Release/libuv.lib src/qjs-libc.obj src/resource.res $(LDFLAGS) /OUT:nodert.exe
	$(LINK) src/bindings.obj src/nodert.obj libqjs/Release/qjs.lib libuv/Release/libuv.lib src/qjs-libc.obj src/resource.res $(LDFLAGS) /OUT:nodert.exe

nodert.obj:
	$(CC) src/nodert.c $(CFLAGS) /c /Fo:src/nodert.obj

qjs-libc.obj:
	$(CC) quickjs/quickjs-libc.c $(CFLAGS) /experimental:c11atomics /c /Fo:src/qjs-libc.obj

bindings.obj:
	$(CC) src/bindings.c $(CFLAGS) /c /Fo:src/bindings.obj

# nextTick.obj:
# 	$(CC) src/nextTick.c $(CFLAGS) /c /Fo:src/nextTick.obj

# timers.obj:
# 	$(CXX) src/timers.cpp $(CXXFLAGS) /c /Fo:src/timers.obj

# fs.obj:
# 	$(CXX) src/fs.cpp $(CXXFLAGS) /c /Fo:src/fs.obj

resource.res:
	$(RC) $(RFLAGS) /fo "src/resource.res" "src/resource.rc"

clean:
	del /Q nodert.exe src\*.obj src\*.res