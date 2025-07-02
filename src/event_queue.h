#ifndef NODERT_EVENT_QUEUE_H
#define NODERT_EVENT_QUEUE_H

#include <stdint.h>
#include <stdbool.h>
#include <quickjs.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * (data: T) => void
 */
typedef void (*event_callback)(void* data);
/**
 * (data: S) => T
 */
typedef void (*worker_callback)(void* data);


int init_event_queues();

int push_to_generic_event_queue(worker_callback worker_cb, void* data, event_callback event_cb);

int execute_event_sync(worker_callback worker_cb, void* data, event_callback event_cb);

uint64_t push_to_immediate_event_queue(JSContext *ctx, JSValue cb);

uint64_t push_to_next_tick_event_queue(JSContext *ctx, JSValue cb);

uint64_t push_to_timeout_event_queue(JSContext *ctx, JSValue cb, uint64_t delay);

uint64_t push_to_interval_event_queue(JSContext *ctx, JSValue cb, uint64_t interval);

int consume_generic_event_queue();

int consume_immediate_event_queue(JSContext *ctx);

int consume_next_tick_event_queue(JSContext *ctx);

int consume_timeout_event_queue(JSContext *ctx, uint64_t* min_delay);

int clear_immediate_event_queue(JSContext *ctx, uint64_t id);

int clear_timeout_event_queue(JSContext *ctx, uint64_t id);

bool has_pending_generic_queue_jobs();

bool has_pending_immediate_queue_jobs();

bool has_pending_next_tick_queue_jobs();

bool has_pending_timeout_queue_jobs();

bool has_arriving_generic_queue_jobs();

#ifdef __cplusplus
}
#endif

#endif //NODERT_EVENT_QUEUE_H