
function addSerializeCallback(callback, data) {
    //   throwIfNotBuildingSnapshot();
    //   validateFunction(callback, 'callback');
    //   serializeCallbacks.push([callback, data]);
}

function isBuildingSnapshot() {
    //   return isBuildingSnapshotBuffer[0];
    return false;
}


module.exports = {
    namespace: {
        addSerializeCallback,
        isBuildingSnapshot,
    },
}