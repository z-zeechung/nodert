#include <io.h>
#include <windows.h>
#include <errno.h>
#include <stdbool.h>
#include <stdio.h>
#include <direct.h>
#include "win_errno.h"
#include <sys/stat.h>
#include <math.h>
#include <fcntl.h>
#include "win_dirent.h"

#include "fs.h"
#include "types.h"

#define MAX(a,b) (((a) > (b)) ? (a) : (b))
#define MIN(a,b) (((a) < (b)) ? (a) : (b))

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

static char* wchar_to_utf8(const wchar_t* wstr) {
    if (!wstr) return NULL;

    int size = WideCharToMultiByte(CP_UTF8, 0, wstr, -1, NULL, 0, NULL, NULL);
    if (size == 0) return NULL;

    char* utf8 = (char*)malloc(size * sizeof(char));
    if (!utf8) return NULL;

    if (WideCharToMultiByte(CP_UTF8, 0, wstr, -1, utf8, size, NULL, NULL) == 0) {
        free(utf8);
        return NULL;
    }

    return utf8;
}


static inline void fs_access(char* path, int mode) {
    wchar_t* wpath = utf8_to_wchar(path);
    if (!wpath){
        errno = ENOMEM;
        return;
    }
    _waccess(wpath, mode);
    free(wpath);
}

static inline bool fs_exists(char* path) {
    fs_access(path, F_OK);
    if(errno==ENOMEM){
        return false;
    }
    bool ret = (errno == 0);
    errno = 0;
    return ret;
}

static inline int fs_open(char* path, int flags, int mode) {
    wchar_t* wpath = utf8_to_wchar(path);
    if (!wpath){
        errno = ENOMEM;
        return -1;
    }
    int fd = _wopen(wpath, flags, mode);
    free(wpath);
    return fd;
}

static inline void fs_close(int fd) {
    _close(fd);
}

static inline int64_t fs_read(int fd, array_buffer buffer, int64_t offset, int64_t length, int64_t position){
    if(_lseek(fd, position, SEEK_SET)<0){
        return -1;
    }
    int64_t bytes_read = _read(fd, buffer.data+offset, MIN(length, MAX(buffer.size-offset, 0)));
    if(bytes_read<0){
        return -1;
    }
    return bytes_read;
}

static inline char* fs_read_file_utf8(char* path, int flags){
    int fd = fs_open(path, flags, 0);
    if(fd<0){
        return NULL;
    }

    struct _stat64 stat;
    if(_fstat64(fd, &stat)<0){
        fs_close(fd);
        return NULL;
    }

    char* buffer = malloc(stat.st_size + 1);
    if(buffer == NULL){
        errno = ENOMEM;
        fs_close(fd);
        return NULL;
    }

    uint64_t bytes_read = read(fd, buffer, stat.st_size);
    fs_close(fd);
    if(bytes_read<0){
        free(buffer);
        return NULL;
    }

    buffer[bytes_read] = '\0';

    return buffer;
}

static inline void fs_rename(char* old_path, char* new_path){
    wchar_t* wold_path = utf8_to_wchar(old_path);
    wchar_t* wnew_path = utf8_to_wchar(new_path);
    if (!wold_path || !wnew_path){
        errno = ENOMEM;
        if(wold_path) free(wold_path);
        if(wnew_path) free(wnew_path);
        return;
    }
    _wrename(wold_path, wnew_path);
    free(wold_path);
    free(wnew_path);
}

static inline void fs_ftruncate(int fd, int64_t len){
    _chsize_s(fd, len);
}

static inline void fs_rmdir(char* path){
    wchar_t* wpath = utf8_to_wchar(path);
    if (!wpath){
        errno = ENOMEM;
        return;
    }
    _wrmdir(wpath);
    free(wpath);
}

static inline void fs_fsync(int fd){
    HANDLE hFile = (HANDLE)_get_osfhandle(fd);
    if(hFile == INVALID_HANDLE_VALUE){
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return;
    }
    if (!FlushFileBuffers(hFile)) {
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return;
    }
}

static inline void fs_fdatasync(int fd){
    fs_fsync(fd);
}

static inline string_array fs_readdir(char* path){

    string_array str_arr = {};

    wchar_t* wpath = utf8_to_wchar(path);
    if (!wpath){
        errno = ENOMEM;
        return str_arr;
    }

    WIN32_FIND_DATAW findData;
    HANDLE hFind;
    wchar_t searchPath[MAX_PATH];
    wchar_t fullPath[MAX_PATH];

    int max_path = 16;
    int current_path = 0;
    char** result = (char**)malloc(sizeof(char*) * max_path);
    if(!result){
        errno = ENOMEM;
        free(wpath);
        return str_arr;
    }
    for(int i=0;i<max_path;i++){ result[i] = NULL; }

    swprintf_s(searchPath, MAX_PATH, L"%s\\*", wpath);

    hFind = FindFirstFileW(searchPath, &findData);
    if (hFind == INVALID_HANDLE_VALUE) {
        errno = win_errno_to_posix_errno(GetLastError(), ENOENT);
        free(wpath);
        free(result);
        return str_arr;
    }

    do {
        // no . or ..
        if (wcscmp(findData.cFileName, L".") == 0 || 
            wcscmp(findData.cFileName, L"..") == 0) {
            continue;
        }
        
        // full path
        swprintf_s(fullPath, MAX_PATH, L"%s\\%s", wpath, findData.cFileName);

        if(current_path == max_path){
            max_path *= 2;
            result = (char**)realloc(result, sizeof(char*) * max_path);
            if(!result){
                errno = ENOMEM;
                for(int i=0;i<current_path;i++){ free(result[i]); }
                free(result);
                free(wpath);
                return str_arr;
            }
            for(int i=current_path;i<max_path;i++){ result[i] = NULL; }
        }
        result[current_path] = wchar_to_utf8(fullPath);
        if(!result[current_path]){
            errno = ENOMEM;
            for(int i=0;i<current_path;i++){ free(result[i]); }
            free(result);
            free(wpath);
            return str_arr;
        }
        current_path++;
        
    } while (FindNextFileW(hFind, &findData));
    
    FindClose(hFind);

    free(wpath);

    str_arr.count = current_path;
    str_arr.strs = result;

    return str_arr;
}

static inline int64_array fs_fstat(int fd){

    int64_array arr;

    struct _stat64 st;
    if (_fstat64(fd, &st)<0) { return arr; }

    HANDLE hFile = (HANDLE)_get_osfhandle(fd);
    if (hFile == INVALID_HANDLE_VALUE) { 
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return arr; 
    }

    // blksize
    int blksize = 4096;
        char filePath[MAX_PATH];
        if (!GetFinalPathNameByHandleA(hFile, filePath, MAX_PATH, VOLUME_NAME_DOS)) {
            errno = win_errno_to_posix_errno(GetLastError(), EIO);
            return arr;
        }
        char drive[4] = { filePath[0], filePath[1], filePath[2], '\0' };
        if(!(drive[0]>='A'&&drive[0]<='z'&&drive[1]==':'&&(drive[2]=='\\'||drive[2]=='/'))){
            goto end_blksize;   // not something like C:\, use default value
        }
        DWORD sectorsPerCluster, bytesPerSector;
        DWORD freeClusters, totalClusters;
        if (!GetDiskFreeSpaceA(drive,                 
            &sectorsPerCluster, &bytesPerSector, &freeClusters, &totalClusters)
        ) {
            errno = win_errno_to_posix_errno(GetLastError(), EIO);
            return arr;
        }
        blksize = bytesPerSector;
    end_blksize:

    // timestamps
    int64_t atime_sec, mtime_sec, ctime_sec, birthtime_sec;
    int64_t atime_nsec, mtime_nsec, ctime_nsec, birthtime_nsec;
        FILETIME ftCreate, ftAccess, ftModify;
        if(!GetFileTime(hFile, &ftCreate, &ftAccess, &ftModify)){
            errno = win_errno_to_posix_errno(GetLastError(), EIO);
            return arr;
        }
        #define FS_STAT_WINDOWS_TICK 10000000
        #define FS_STAT_SEC_TO_UNIX  11644473600LL
        #define FS_STAT_TIME_SEC(ft, sec)   do {ULARGE_INTEGER uli; uli.LowPart = ft.dwLowDateTime; uli.HighPart = ft.dwHighDateTime; sec = uli.QuadPart / FS_STAT_WINDOWS_TICK - FS_STAT_SEC_TO_UNIX;} while(0)
        #define FS_STAT_TIME_NSEC(ft, nsec) do {ULARGE_INTEGER uli; uli.LowPart = ft.dwLowDateTime; uli.HighPart = ft.dwHighDateTime; int64_t remaining = uli.QuadPart % FS_STAT_WINDOWS_TICK; nsec = remaining * 100;} while(0)
        FS_STAT_TIME_SEC(ftAccess, atime_sec);
        FS_STAT_TIME_SEC(ftModify, mtime_sec);
        FS_STAT_TIME_SEC(ftModify, ctime_sec);
        FS_STAT_TIME_SEC(ftCreate, birthtime_sec);
        FS_STAT_TIME_NSEC(ftAccess, atime_nsec);
        FS_STAT_TIME_NSEC(ftModify, mtime_nsec);
        FS_STAT_TIME_NSEC(ftModify, ctime_nsec);
        FS_STAT_TIME_NSEC(ftCreate, birthtime_nsec);
        #undef FS_STAT_TIME_SEC
        #undef FS_STAT_TIME_NSEC
        #undef FS_STAT_WINDOWS_TICK
        #undef FS_STAT_SEC_TO_UNIX
    // end timestamps

    arr.count = 18;
    arr.data = (int64_t*)malloc(sizeof(int64_t) * arr.count);

    arr.data[0] = st.st_dev;
    arr.data[1] = st.st_mode;
    arr.data[2] = st.st_nlink;
    arr.data[3] = st.st_uid;
    arr.data[4] = st.st_gid;
    arr.data[5] = st.st_rdev;
    arr.data[6] = blksize;
    arr.data[7] = st.st_ino;
    arr.data[8] = st.st_size;
    // blocks
    arr.data[9] = (unsigned long)ceil((double)st.st_size / blksize);
    arr.data[10] = atime_sec;
    arr.data[11] = atime_nsec;
    arr.data[12] = mtime_sec;
    arr.data[13] = mtime_nsec;
    arr.data[14] = ctime_sec;
    arr.data[15] = ctime_nsec;
    arr.data[16] = birthtime_sec;
    arr.data[17] = birthtime_nsec;

    return arr;
}

static inline int64_array fs_lstat(char* path){

    int64_array arr;

    wchar_t *wpath = utf8_to_wchar(path);
    if(!wpath) {
        errno = ENOMEM;
        return arr;
    }
    
    HANDLE hFile = CreateFileA(
        wpath,                              
        GENERIC_READ,                      
        FILE_SHARE_READ | FILE_SHARE_WRITE, 
        NULL,                              
        OPEN_EXISTING,                     
        FILE_FLAG_OPEN_REPARSE_POINT,      // no follow symlink
        NULL                               
    );
    free(wpath);
    if(hFile == INVALID_HANDLE_VALUE){
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return arr;
    }

    int fd = _open_osfhandle((intptr_t)hFile, O_RDONLY);
    if(fd == -1){
        CloseHandle(hFile);
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return arr;
    }

    arr = fs_fstat(fd);

    CloseHandle(hFile);

    return arr;
}

static inline int64_array fs_stat(char* path){

    int64_array arr;

    int fd = open(path, O_RDONLY);
    if(fd == -1){ return arr; }

    arr = fs_fstat(fd);

    close(fd);

    return arr;
}