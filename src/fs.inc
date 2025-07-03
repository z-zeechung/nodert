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

    string_array arr;

    wchar_t* wpath = utf8_to_wchar(path);
    if (!wpath){ errno = ENOMEM; return arr; }

    DIR* dir = _wopendir(wpath);
    free(wpath);
    if (!dir){ return arr; }

    int max_entries = 16;
    arr.strs = malloc(sizeof(char*) * max_entries);
    arr.count = 0;
    if(!arr.strs){ closedir(dir); errno = ENOMEM; return arr; }

    struct dirent *entry;
    while ((entry = readdir(dir)) != NULL) {
        if(
            (entry->d_name[0]=='.' && entry->d_name[1]==0) ||
            (entry->d_name[0]=='.' && entry->d_name[1]=='.' && entry->d_name[2]==0)
        ){
            continue;
        }
        if(arr.count == max_entries){
            max_entries *= 2;
            char** prev_strs = arr.strs; arr.strs = realloc(arr.strs, sizeof(char*) * max_entries);
            if(!arr.strs){ 
                for(int i = 0; i < arr.count; i++) free(prev_strs[i]);
                free(prev_strs);
                closedir(dir); 
                errno = ENOMEM; 
                return arr; 
            }
        }
        int len = strlen(entry->d_name);
        arr.strs[arr.count] = malloc(sizeof(char)*(len+1));
        if(!arr.strs[arr.count]){
            for(int i = 0; i < arr.count; i++) free(arr.strs[i]);
            free(arr.strs);
            closedir(dir);
            errno = ENOMEM;
            return arr;
        }
        memcpy(arr.strs[arr.count], entry->d_name, len+1);
        arr.count++;
    }

    closedir(dir);

    if(errno != 0) {
        for(int i = 0; i < arr.count; i++) free(arr.strs[i]);
        free(arr.strs);
        return arr;
    }

    return arr;
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

static inline int64_array fs_statfs(char* path){

    int64_array arr;

    wchar_t* wpath = utf8_to_wchar(path);
    if(wpath == NULL){ errno = ENOMEM; return arr; }

    int type = 0;

    DWORD sectors_per_cluster;
    DWORD bytes_per_sector;
    DWORD free_clusters;
    DWORD total_clusters;
    if(!GetDiskFreeSpaceW(
        wpath,
        &sectors_per_cluster, &bytes_per_sector,
        &free_clusters, &total_clusters
    )){
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        free(wpath);
        return arr;
    }

    int64_t bsize = sectors_per_cluster * bytes_per_sector;
    int64_t blocks = total_clusters;
    int64_t bfree = free_clusters;
    int64_t bavail = free_clusters;

    int files = 0;
    int ffree = 0;

    arr.count = 7;
    arr.data = malloc(sizeof(int64_t) * arr.count);
    if(arr.data == NULL){
        free(wpath);
        errno = ENOMEM; 
        return arr; 
    }

    arr.data[0] = type;
    arr.data[1] = bsize;
    arr.data[2] = blocks;
    arr.data[3] = bfree;
    arr.data[4] = bavail;
    arr.data[5] = files;
    arr.data[6] = ffree;

    free(wpath);

    return arr;
}

static inline char* fs_readlink(char* path){

    wchar_t* wpath = utf8_to_wchar(path);
    if(wpath == NULL){
        errno = ENOMEM;
        return NULL;
    }

    HANDLE hFile = CreateFileW(
        wpath,  
        GENERIC_READ,
        FILE_SHARE_READ,
        NULL,
        OPEN_EXISTING,
        FILE_FLAG_BACKUP_SEMANTICS,
        NULL
    );

    if (hFile == INVALID_HANDLE_VALUE) {
        free(wpath);
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return NULL;
    }

    wchar_t finalPath[MAX_PATH];
    DWORD result = GetFinalPathNameByHandleW(
        hFile,
        finalPath,
        MAX_PATH,
        FILE_NAME_NORMALIZED | VOLUME_NAME_DOS
    );

    if (result == 0){
        CloseHandle(hFile);
        free(wpath);
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return NULL;
    }

    CloseHandle(hFile);
    free(wpath);

    return wchar_to_utf8(finalPath);
}

static inline void fs_link(char* oldpath, char* newpath){
    wchar_t* woldpath = utf8_to_wchar(oldpath);
    wchar_t* wnewpath = utf8_to_wchar(newpath);

    if(woldpath == NULL || wnewpath == NULL){
        if(woldpath != NULL) free(woldpath);
        if(wnewpath != NULL) free(wnewpath);
        errno = ENOMEM;
        return;
    }

    if(CreateHardLinkW(wnewpath, woldpath, NULL) == 0){
        free(woldpath);
        free(wnewpath);
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return;
    }

    free(woldpath);
    free(wnewpath);
}

static inline void fs_unlink(char* path){
    wchar_t* wpath = utf8_to_wchar(path);

    if(wpath == NULL){
        errno = ENOMEM;
        return;
    }

    _wunlink(wpath);

    free(wpath);
}

static inline void fs_chmod(char* path, int mode){
    wchar_t* wpath = utf8_to_wchar(path);

    if(wpath == NULL){
        errno = ENOMEM;
        return;
    }

    _wchmod(wpath, mode);

    free(wpath);
}

static inline void fs_lchown(char* path, int uid, int gid){
    // do nothing in win32
}

static inline void fs_fchown(int fd, int uid, int gid){
    // do nothing in win32
}

static inline void fs_chown(char* path, int uid, int gid){
    // do nothing in win32
}

static inline void fs_futimes(int fd, int64_t atime, int64_t mtime){

    int64_t atime_ft = ((int64_t)atime + 11644473600LL) * 10000000LL;
    int64_t mtime_ft = ((int64_t)mtime + 11644473600LL) * 10000000LL;

    FILETIME ft_atime, ft_mtime;
    ft_atime.dwLowDateTime = (DWORD)(atime_ft & 0xFFFFFFFF);
    ft_atime.dwHighDateTime = (DWORD)(atime_ft >> 32);
    ft_mtime.dwLowDateTime = (DWORD)(mtime_ft & 0xFFFFFFFF);
    ft_mtime.dwHighDateTime = (DWORD)(mtime_ft >> 32);

    HANDLE h = (HANDLE)_get_osfhandle(fd);
    if(h == INVALID_HANDLE_VALUE){
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return;
    }

    if(!SetFileTime(h, NULL, &ft_atime, &ft_mtime)){
        errno = win_errno_to_posix_errno(GetLastError(), EIO);
        return;
    }
}
