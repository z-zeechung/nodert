
CC = cl
CFLAGS = /MT -Iquickjs -Isrc /std:c11 /Os /O1

LINK = link
LDFLAGS = /NODEFAULTLIB:api-ms-win-crt-*.lib /NODEFAULTLIB:ucrt.lib ucrt.lib vcruntime.lib kernel32.lib libcmt.lib libvcruntime.lib Shell32.lib Advapi32.lib ntdll.lib wbemuuid.lib /NODEFAULTLIB:MSVCRT /NODEFAULTLIB:libucrt.lib

all: nodert.exe

nodert.exe: os.obj constants.obj util.obj nodert.obj qjs-libc.obj
	$(LINK) src/os.obj src/constants.obj src/util.obj src/nodert.obj libqjs/Release/qjs.lib src/qjs-libc.obj $(LDFLAGS) /OUT:nodert.exe

nodert.obj:
	$(CC) src/nodert.c $(CFLAGS) /c /Fo:src/nodert.obj

qjs-libc.obj:
	$(CC) quickjs/quickjs-libc.c $(CFLAGS) /experimental:c11atomics /c /Fo:src/qjs-libc.obj

os.obj:
	$(CC) src/os.c $(CFLAGS) /c /Fo:src/os.obj

constants.obj:
	$(CC) src/constants.c $(CFLAGS) /c /Fo:src/constants.obj

util.obj:
	$(CC) src/util.c $(CFLAGS) /c /Fo:src/util.obj

clean:
	del /Q nodert.exe src\*.obj