
/**
 * Copied from https://github.com/libuv/libuv/blob/v1.x/src/win/error.c
 * Copyright Joyent, Inc. and others; MIT License: free to use, modify, distribute, no warranty.
 */

#ifndef WIN_ERRNO_H
#define WIN_ERRNO_H

#include <assert.h>
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <windows.h>

#ifdef __cplusplus
extern "C" {
#endif

static int win_errno_to_posix_errno(int sys_errno, int default_errno) {
  if (sys_errno <= 0) {
    return sys_errno;  /* If < 0 then it's already a libuv error. */
  }

  switch (sys_errno) {
    case WSAEACCES:                         return EACCES;
    case ERROR_ELEVATION_REQUIRED:          return EACCES;
    case ERROR_CANT_ACCESS_FILE:            return EACCES;
    case ERROR_ADDRESS_ALREADY_ASSOCIATED:  return EADDRINUSE;
    case WSAEADDRINUSE:                     return EADDRINUSE;
    case WSAEADDRNOTAVAIL:                  return EADDRNOTAVAIL;
    case WSAEAFNOSUPPORT:                   return EAFNOSUPPORT;
    case WSAEWOULDBLOCK:                    return EAGAIN;
    case ERROR_NO_DATA:                     return EAGAIN;
    case WSAEALREADY:                       return EALREADY;
    case ERROR_INVALID_FLAGS:               return EBADF;
    case ERROR_INVALID_HANDLE:              return EBADF;
    case ERROR_LOCK_VIOLATION:              return EBUSY;
    case ERROR_PIPE_BUSY:                   return EBUSY;
    case ERROR_SHARING_VIOLATION:           return EBUSY;
    case ERROR_OPERATION_ABORTED:           return ECANCELED;
    case WSAEINTR:                          return ECANCELED;
    // case ERROR_NO_UNICODE_TRANSLATION:      return ECHARSET;
    case ERROR_CONNECTION_ABORTED:          return ECONNABORTED;
    case WSAECONNABORTED:                   return ECONNABORTED;
    case ERROR_CONNECTION_REFUSED:          return ECONNREFUSED;
    case WSAECONNREFUSED:                   return ECONNREFUSED;
    case ERROR_NETNAME_DELETED:             return ECONNRESET;
    case WSAECONNRESET:                     return ECONNRESET;
    case ERROR_ALREADY_EXISTS:              return EEXIST;
    case ERROR_FILE_EXISTS:                 return EEXIST;
    case ERROR_NOACCESS:                    return EFAULT;
    case WSAEFAULT:                         return EFAULT;
    case ERROR_HOST_UNREACHABLE:            return EHOSTUNREACH;
    case WSAEHOSTUNREACH:                   return EHOSTUNREACH;
    case ERROR_INSUFFICIENT_BUFFER:         return EINVAL;
    case ERROR_INVALID_DATA:                return EINVAL;
    case ERROR_INVALID_PARAMETER:           return EINVAL;
    case ERROR_SYMLINK_NOT_SUPPORTED:       return EINVAL;
    case WSAEINVAL:                         return EINVAL;
    case WSAEPFNOSUPPORT:                   return EINVAL;
    case ERROR_BEGINNING_OF_MEDIA:          return EIO;
    case ERROR_BUS_RESET:                   return EIO;
    case ERROR_CRC:                         return EIO;
    case ERROR_DEVICE_DOOR_OPEN:            return EIO;
    case ERROR_DEVICE_REQUIRES_CLEANING:    return EIO;
    case ERROR_DISK_CORRUPT:                return EIO;
    case ERROR_EOM_OVERFLOW:                return EIO;
    case ERROR_FILEMARK_DETECTED:           return EIO;
    case ERROR_GEN_FAILURE:                 return EIO;
    case ERROR_INVALID_BLOCK_LENGTH:        return EIO;
    case ERROR_IO_DEVICE:                   return EIO;
    case ERROR_NO_DATA_DETECTED:            return EIO;
    case ERROR_NO_SIGNAL_SENT:              return EIO;
    case ERROR_OPEN_FAILED:                 return EIO;
    case ERROR_SETMARK_DETECTED:            return EIO;
    case ERROR_SIGNAL_REFUSED:              return EIO;
    case WSAEISCONN:                        return EISCONN;
    case ERROR_CANT_RESOLVE_FILENAME:       return ELOOP;
    case ERROR_TOO_MANY_OPEN_FILES:         return EMFILE;
    case WSAEMFILE:                         return EMFILE;
    case WSAEMSGSIZE:                       return EMSGSIZE;
    case ERROR_BUFFER_OVERFLOW:             return ENAMETOOLONG;
    case ERROR_FILENAME_EXCED_RANGE:        return ENAMETOOLONG;
    case ERROR_NETWORK_UNREACHABLE:         return ENETUNREACH;
    case WSAENETUNREACH:                    return ENETUNREACH;
    case WSAENOBUFS:                        return ENOBUFS;
    case ERROR_BAD_PATHNAME:                return ENOENT;
    case ERROR_DIRECTORY:                   return ENOENT;
    case ERROR_ENVVAR_NOT_FOUND:            return ENOENT;
    case ERROR_FILE_NOT_FOUND:              return ENOENT;
    case ERROR_INVALID_NAME:                return ENOENT;
    case ERROR_INVALID_DRIVE:               return ENOENT;
    case ERROR_INVALID_REPARSE_DATA:        return ENOENT;
    case ERROR_MOD_NOT_FOUND:               return ENOENT;
    case ERROR_PATH_NOT_FOUND:              return ENOENT;
    case WSAHOST_NOT_FOUND:                 return ENOENT;
    case WSANO_DATA:                        return ENOENT;
    case ERROR_NOT_ENOUGH_MEMORY:           return ENOMEM;
    case ERROR_OUTOFMEMORY:                 return ENOMEM;
    case ERROR_CANNOT_MAKE:                 return ENOSPC;
    case ERROR_DISK_FULL:                   return ENOSPC;
    case ERROR_EA_TABLE_FULL:               return ENOSPC;
    case ERROR_END_OF_MEDIA:                return ENOSPC;
    case ERROR_HANDLE_DISK_FULL:            return ENOSPC;
    case ERROR_NOT_CONNECTED:               return ENOTCONN;
    case WSAENOTCONN:                       return ENOTCONN;
    case ERROR_DIR_NOT_EMPTY:               return ENOTEMPTY;
    case WSAENOTSOCK:                       return ENOTSOCK;
    case ERROR_NOT_SUPPORTED:               return ENOTSUP;
    case ERROR_BROKEN_PIPE:                 return EOF;
    case ERROR_ACCESS_DENIED:               return EPERM;
    case ERROR_PRIVILEGE_NOT_HELD:          return EPERM;
    case ERROR_BAD_PIPE:                    return EPIPE;
    case ERROR_PIPE_NOT_CONNECTED:          return EPIPE;
    case WSAESHUTDOWN:                      return EPIPE;
    case WSAEPROTONOSUPPORT:                return EPROTONOSUPPORT;
    case ERROR_WRITE_PROTECT:               return EROFS;
    case ERROR_SEM_TIMEOUT:                 return ETIMEDOUT;
    case WSAETIMEDOUT:                      return ETIMEDOUT;
    case ERROR_NOT_SAME_DEVICE:             return EXDEV;
    case ERROR_INVALID_FUNCTION:            return EISDIR;
    case ERROR_META_EXPANSION_TOO_LONG:     return E2BIG;
    // case WSAESOCKTNOSUPPORT:                return ESOCKTNOSUPPORT;
    // case ERROR_BAD_EXE_FORMAT:              return EFTYPE;
    default:                                return default_errno;
  }
}

#ifdef __cplusplus
}
#endif

#endif // WIN_ERRNO_H