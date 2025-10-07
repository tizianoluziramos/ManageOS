import os from "os";
export default function SystemInfo() {
    return {
        platform: os.platform(),
        architecture: os.arch(),
        release: os.release(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        cpus: os.cpus(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        loadAverage: os.loadavg(),
        tmpDir: os.tmpdir(),
        homeDir: os.homedir(),
        type: os.type(),
        userInfo: os.userInfo(),
    };
}
//# sourceMappingURL=systeminfo.js.map