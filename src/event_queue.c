#include <event_queue.h>
#include <stdlib.h>
#include <sc_list.h>

#include <windows.h>
static FORCEINLINE int64_t get_current_time_milliseconds() {
    FILETIME ft;
    GetSystemTimeAsFileTime(&ft); 

    ULARGE_INTEGER uli;
    uli.LowPart = ft.dwLowDateTime;
    uli.HighPart = ft.dwHighDateTime;

    int64_t unix_time = (int64_t)(uli.QuadPart - 116444736000000000ULL) / 10000LL;

    return unix_time;
}
#include <intrin.h>


#define CONCURRENT_THREADS 4


typedef struct sc_list sc_list_t;

typedef struct {
    volatile void* data;
    event_callback cb;
    volatile bool done; // must be processed within memory barrier
    sc_list_t node;
} event_t;

typedef struct {
    JSValue cb;
    uint64_t when;
    uint64_t interval;
    sc_list_t node;
} timer_event_t;


static sc_list_t generic_queue;
static sc_list_t immediate_queue;
static sc_list_t next_tick_queue;
static sc_list_t timer_queue;

int init_event_queues(){

    sc_list_init(&generic_queue);
    sc_list_init(&immediate_queue);
    sc_list_init(&next_tick_queue);
    sc_list_init(&timer_queue);
    
    return 0;
}

typedef struct{
    worker_callback worker_cb;
    event_t* e;
} GenericEventPayload;
VOID CALLBACK GenericEventCallback(
    _Inout_     PTP_CALLBACK_INSTANCE Instance,
    _Inout_opt_ PVOID                 Context
){
    GenericEventPayload* payload = (GenericEventPayload*)Context;
    payload->worker_cb(
        payload->e->data
    );
    _WriteBarrier(); MemoryBarrier();
    payload->e->done = true;
    free(payload);
}
int push_to_generic_event_queue(worker_callback worker_cb, void* data, event_callback event_cb){

    event_t* e = (event_t*)malloc(sizeof(event_t));
    e->data = data;
    e->cb = event_cb;
    e->done = false;

    if(worker_cb==NULL){
        e->done = true;
        sc_list_init(&(e->node));
        sc_list_add_tail(&generic_queue, &(e->node));
        return 0;
    }

    GenericEventPayload* payload = (GenericEventPayload*)malloc(sizeof(GenericEventPayload));
    payload->e = e;
    payload->worker_cb = worker_cb;
    bool success = TrySubmitThreadpoolCallback(
        GenericEventCallback,
        payload,
        NULL
    );
    if(!success){
        free(e);
        free(payload);
        return 1;
    }

    sc_list_init(&(e->node));
    sc_list_add_tail(&generic_queue, &(e->node));

    return 0;
}

int execute_event_sync(worker_callback worker_cb, void* data, event_callback event_cb){
    if(worker_cb==NULL){
        event_cb(data);
        return 0;
    }
    worker_cb(data);
    event_cb(data);
    return 0;
}

static uint64_t push_to_timer_queue(
    JSContext* ctx,
    sc_list_t* queue, 
    JSValue cb,
    uint64_t delay,
    uint64_t interval
){

    JS_DupValue(ctx, cb);

    uint64_t now_msec = get_current_time_milliseconds();

    timer_event_t* e = (timer_event_t*)malloc(sizeof(timer_event_t));
    e->cb = cb;
    e->when = now_msec + delay;
    e->interval = interval;

    sc_list_init(&(e->node));   // that's crazy
    sc_list_add_tail(queue, &(e->node));

    return (uint64_t)e;
}

uint64_t push_to_immediate_event_queue(JSContext *ctx, JSValue cb){
    return push_to_timer_queue(ctx, &immediate_queue, cb, 0, 0);
}

uint64_t push_to_next_tick_event_queue(JSContext *ctx, JSValue cb){
    return push_to_timer_queue(ctx, &next_tick_queue, cb, 0, 0);
}

uint64_t push_to_timeout_event_queue(JSContext *ctx, JSValue cb, uint64_t delay){
    return push_to_timer_queue(ctx, &timer_queue, cb, delay, 0);
}
uint64_t push_to_interval_event_queue(JSContext *ctx, JSValue cb, uint64_t interval){
    return push_to_timer_queue(ctx, &timer_queue, cb, interval, interval);
}

int consume_generic_event_queue(){
    if(sc_list_is_empty(&generic_queue)){
        return 0;
    }

    sc_list_t *it;
    struct sc_list *tmp;
    event_t* e;
    sc_list_foreach_safe(&generic_queue, tmp, it){
        e = sc_list_entry(it, event_t, node);
        if(e->done){
            _ReadBarrier(); MemoryBarrier();
            e->cb(e->data);
            sc_list_del(&generic_queue, &(e->node));
            free(e);
        }
    }
    return 0;
}

static int consume_timer_queue(JSContext *ctx, sc_list_t* queue){

    if(sc_list_is_empty(queue)){
        return 0;
    }

    sc_list_t *it;
    struct sc_list *tmp;
    timer_event_t* e;
    sc_list_foreach_safe(queue, tmp, it){
        e = sc_list_entry(it, timer_event_t, node);
        JS_Call(ctx, e->cb, JS_UNDEFINED, 0, NULL);
        JS_FreeValue(ctx, e->cb);
        sc_list_del(queue, &(e->node));
        free(e);
    }
    return 0;
}

int consume_immediate_event_queue(JSContext *ctx){
    return consume_timer_queue(ctx, &immediate_queue);
}

int consume_next_tick_event_queue(JSContext *ctx){
    return consume_timer_queue(ctx, &next_tick_queue);
}

/**
 * min_delay is 0 when the queue is empty
 */
int consume_timeout_event_queue(JSContext *ctx, uint64_t* min_delay){

    *min_delay = 0;

    if(sc_list_is_empty(&timer_queue)){
        return 0;
    }

    uint64_t now_msec = get_current_time_milliseconds();

    sc_list_t *it;
    struct sc_list *tmp;
    timer_event_t* e;
    sc_list_foreach_safe(&timer_queue, tmp, it){
        e = sc_list_entry(it, timer_event_t, node);
        if(e->when <= now_msec){
            JS_Call(ctx, e->cb, JS_UNDEFINED, 0, NULL);
            if(e->interval>0){
                e->when = now_msec + e->interval;
                if(*min_delay > e->interval){
                    *min_delay = e->interval;
                }
            }else{
                JS_FreeValue(ctx, e->cb);
                sc_list_del(&timer_queue, &(e->node));
                free(e);
            }
        }else if(*min_delay > e->when - now_msec){
            *min_delay = e->when - now_msec;
        }
    }
    return 0;
}

static int clear_timer_event(JSContext *ctx, sc_list_t* queue, uint64_t id){
    sc_list_t *it;
    struct sc_list *tmp;
    timer_event_t* e;
    sc_list_foreach_safe(queue, tmp, it){
        e = sc_list_entry(it, timer_event_t, node);
        if(id == (uint64_t)e){
            JS_FreeValue(ctx, e->cb);
            sc_list_del(queue, &(e->node));
            free(e);
        }
    }
    return 0;
}

int clear_immediate_event_queue(JSContext *ctx, uint64_t id){
    return clear_timer_event(ctx, &immediate_queue, id);
}

int clear_timeout_event_queue(JSContext *ctx, uint64_t id){
    return clear_timer_event(ctx, &timer_queue, id);
}

bool has_pending_generic_queue_jobs(){
    return !sc_list_is_empty(&generic_queue);
}

bool has_pending_immediate_queue_jobs(){
    return !sc_list_is_empty(&immediate_queue);
}

bool has_pending_next_tick_queue_jobs(){
    return !sc_list_is_empty(&next_tick_queue);
}

bool has_pending_timeout_queue_jobs(){
    return !sc_list_is_empty(&timer_queue);
}

bool has_arriving_generic_queue_jobs(){
    sc_list_t *it;
    struct sc_list *tmp;
    event_t* e;
    sc_list_foreach_safe(&generic_queue, tmp, it){
        e = sc_list_entry(it, event_t, node);
        if(e->done){
            return true;
        }
    }
    if(sc_list_is_empty(&generic_queue)){
        return true;    // in case somehow wrongly waiting for an empty queue
    }
    return false;
}