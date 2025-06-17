module.exports = {
    queueMicrotask(task){
        Promise.resolve().then(task)
    }
}