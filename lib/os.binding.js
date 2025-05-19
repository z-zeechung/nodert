module.exports = {
    getHostname: os.getHostname,
    getLoadAvg: (arr) => undefined,
    getUptime: os.getUptime,
    getTotalMem: os.getTotalMem,
    getFreeMem: os.getFreeMem,
    getHomeDirectory: os.getHomeDirectory,
    getUserInfo: ()=>{return {
        uid: os.get_uid(),
        gid: os.get_gid(),
        username: os.get_username(),
        homedir: os.getHomeDirectory(),
        shell: os.get_shell(),
    }},
    getAvailableParallelism: ()=>20,
    getOSInformation: ()=>[
        os.get_sysname(),
        os.get_version(),
        os.get_release(),
        os.get_machine()
    ],
    isBigEndian: os.isBigEndian()
}