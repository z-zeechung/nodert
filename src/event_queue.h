#ifndef NODERT_EVENT_QUEUE_H
#define NODERT_EVENT_QUEUE_H

#include <stdint.h>
#include <stdbool.h>
#include <quickjs.h>

#ifdef __cplusplus
extern "C" {
#endif


int init_event_queues();

uint64_t push_to_immediate_event_queue(JSContext *ctx, JSValue cb);

uint64_t push_to_next_tick_event_queue(JSContext *ctx, JSValue cb);

// uint64_t push_to_io_event_queue();

uint64_t push_to_timeout_event_queue(JSContext *ctx, JSValue cb, uint64_t delay);

uint64_t push_to_interval_event_queue(JSContext *ctx, JSValue cb, uint64_t interval);

int consume_immediate_event_queue(JSContext *ctx);

int consume_next_tick_event_queue(JSContext *ctx);

// int consume_io_event_queue();

int consume_timeout_event_queue(JSContext *ctx, uint64_t* min_delay);

int clear_immediate_event_queue(JSContext *ctx, uint64_t id);

int clear_timeout_event_queue(JSContext *ctx, uint64_t id);

bool has_pending_event_queue_jobs();

#ifdef __cplusplus
}
#endif

#endif //NODERT_EVENT_QUEUE_H