module.exports = (_)=>{return {
    compare(a, b){
        // inputs are uint8arrays
        if (a.byteLength < b.byteLength) return -1;
        if (a.byteLength > b.byteLength) return 1;
        for (let i = 0; i < a.byteLength; i++) {
            if (a[i] < b[i]) return -1;
            if (a[i] > b[i]) return 1;
        }
        return 0;
    }
}}