#ifndef NODERT_RESOURCE_H
#define NODERT_RESOURCE_H

#include <windows.h>

#define IDR_INIT_BINDINGS 101

#ifdef __cplusplus
extern "C" {
#endif

static char* load_utf8_resource_file(int id){
    HRSRC hRes = FindResource(NULL, MAKEINTRESOURCE(id), RT_RCDATA);
    if (!hRes) {
        return NULL;
    }

    HGLOBAL hData = LoadResource(NULL, hRes);
    if (!hData) {
        return NULL;
    }

    DWORD dwSize = SizeofResource(NULL, hRes);
    if (dwSize == 0) {
        return NULL;
    }

    LPVOID pData = LockResource(hData);
    if (!pData) {
        return NULL;
    }

    char* utf8 = (char*)malloc(dwSize + 1);
    if(!utf8){
        return NULL;
    }

    memcpy(utf8, pData, dwSize);
    utf8[dwSize] = '\0';

    return utf8;
}


#ifdef __cplusplus
}
#endif

#endif //NODERT_RESOURCE_H
