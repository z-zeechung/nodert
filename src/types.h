#ifndef NODERT_TYPES_H
#define NODERT_TYPES_H

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int64_t size;
    char* data;
} array_buffer;

typedef struct {
    int count;
    char** strs;
} string_array;

typedef struct {
    int count;
    int64_t* data;
} int64_array;

#ifdef __cplusplus
}
#endif

#endif //NODERT_TYPES_H