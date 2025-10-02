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

export default function SystemInfo(): SystemInfoType {
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
