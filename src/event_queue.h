#ifndef NODERT_EVENT_QUEUE_H
#define NODERT_EVENT_QUEUE_H

#include <stdint.h>
#include <stdbool.h>
#include <quickjs.h>

#include <intrin.h>
#define EVENT_READ_BARRIER _ReadBarrier()
#define EVENT_WRITE_BARRIER _WriteBarrier()

#ifdef __cplusplus
extern "C" {
#endif

typedef void (*event_callback)(void* data);

typedef struct {
    void* data;
    event_callback cb;
    volatile bool done; // must be processed within memory barrier
} event_t;

typedef void (*worker_callback)(event_t* e, void* data);


int init_event_queues();

int push_to_generic_event_queue(worker_callback worker_cb, void* data, event_callback event_cb);

int execute_event_sync(worker_callback worker_cb, void* data, event_callback event_cb);

uint64_t push_to_immediate_event_queue(JSContext *ctx, JSValue cb);

uint64_t push_to_next_tick_event_queue(JSContext *ctx, JSValue cb);

uint64_t push_to_timeout_event_queue(JSContext *ctx, JSValue cb, uint64_t delay);

uint64_t push_to_interval_event_queue(JSContext *ctx, JSValue cb, uint64_t interval);

int consume_immediate_event_queue(JSContext *ctx);

int consume_next_tick_event_queue(JSContext *ctx);

// int consume_generic_event_queue();

int consume_timeout_event_queue(JSContext *ctx, uint64_t* min_delay);

int clear_immediate_event_queue(JSContext *ctx, uint64_t id);

int clear_timeout_event_queue(JSContext *ctx, uint64_t id);

bool has_pending_event_queue_jobs();

#ifdef __cplusplus
}
#endif

#endif //NODERT_EVENT_QUEUE_H