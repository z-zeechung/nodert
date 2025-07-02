module.exports = {
    // internal/streams
    errorOrDestroy(self, er){   // internal/fs/streams
        throw new Error('`errorOrDestroy` of `internal/streams` was not implemented in `internal/fs/streams`')
    },
    isIterable(o){  // internal/fs/promises
        throw new Error('`isIterable` of `internal/streams` was not implemented in `internal/fs/promises`')
    },

    // internal/async_hooks
    defaultTriggerAsyncIdScope(a, b, c, d){ // internal/fs/watcher
        throw new Error('`defaultTriggerAsyncIdScope` of `internal/async_hooks` was not implemented in `internal/fs/watcher`')
    },
    symbols: {
        get owner_symbol(){ // internal/fs/watcher
            throw new Error('`symbols.owner_symbol` of `internal/async_hooks` was not implemented in `internal/fs/watcher`')
        }
    },

    // internal/readline
    Interface: class Interface{ // internal/fs/promises
        constructor(){
            throw new Error('`Interface` of `internal/readline` was not implemented in `internal/fs/promises`')
        }
    },

    // internal/worker
    markTransferMode(a, b, c){  // internal/fs/promises
        throw new Error('`markTransferMode` of `internal/worker` was not implemented in `internal/fs/promises`')
    },
    get kDeserialize(){ // internal/fs/promises
        throw new Error('`kDeserialize` of `internal/worker` was not implemented in `internal/fs/promises`')
    },
    get kTransfer(){  // internal/fs/promises
        throw new Error('`kTransfer` of `internal/worker` was not implemented in `internal/fs/promises`')
    },
    get kTransferList(){ // internal/fs/promises
        throw new Error('`kTransferList` of `internal/worker` was not implemented in `internal/fs/promises`')
    },

    // internal/webstreams
    readableStreamCancel(s){ // internal/fs/promises
        throw new Error('`readableStreamCancel` of `internal/webstreams` was not implemented in `internal/fs/promises`')
    },
    ReadableStream: class { // internal/fs/promises
        constructor(){
            throw new Error('`ReadableStream` of `internal/webstreams` was not implemented in `internal/fs/promises`')
        }
    }

}