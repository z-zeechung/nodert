
module.exports = {
    now(){
        let hrtime = process.hrtime();
        hrtime = hrtime[0] * 1e9 + hrtime[1];
        let uptime = bindings.uptime(); 
        uptime = uptime * 1e6; 
        return Math.floor((hrtime - uptime) / 1e6);
    }
}