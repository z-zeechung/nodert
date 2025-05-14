
CC = cl
CFLAGS = /MT -Iquickjs /std:c11 

LINK = link
LDFLAGS = /NODEFAULTLIB:api-ms-win-crt-*.lib /NODEFAULTLIB:ucrt.lib ucrt.lib vcruntime.lib kernel32.lib libcmt.lib libvcruntime.lib /NODEFAULTLIB:MSVCRT /NODEFAULTLIB:libucrt.lib 

all: nodert.exe

nodert.exe: nodert.obj qjs-libc.obj
	$(LINK) src/nodert.obj libqjs/Release/qjs.lib src/qjs-libc.obj $(LDFLAGS) /OUT:nodert.exe

nodert.obj:
	$(CC) src/nodert.c $(CFLAGS) /c /Fo:src/nodert.obj

qjs-libc.obj:
	$(CC) quickjs/quickjs-libc.c $(CFLAGS) /experimental:c11atomics /c /Fo:src/qjs-libc.obj

clean:
	del /Q nodert.exe src\*.obj