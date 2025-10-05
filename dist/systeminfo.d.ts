import os from "os";
type SystemInfoType = {
    platform: NodeJS.Platform;
    architecture: string;
    release: string;
    hostname: string;
    uptime: number;
    cpus: os.CpuInfo[];
    totalMemory: number;
    freeMemory: number;
    loadAverage: number[];
    tmpDir: string;
    homeDir: string;
    type: string;
    userInfo: os.UserInfo<string>;
};
export default function SystemInfo(): SystemInfoType;
export {};
//# sourceMappingURL=systeminfo.d.ts.map