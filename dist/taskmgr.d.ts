interface ProcessInfo {
    imageName: string;
    pid: number;
    sessionName: string;
    sessionNumber: number;
    memUsage: string;
}
declare class Sync {
    static monitorProcess(name: string, callback: (status: "start" | "stop") => void): NodeJS.Timeout;
    static getProcessCount(): number;
    static findByName(name: string): ProcessInfo[];
    static killByName(name: string, force?: boolean): boolean | unknown;
    static killByPid(pid: number, force?: boolean): boolean | unknown;
    static listProcesses(): ProcessInfo[];
}
declare class Async {
    static monitorProcess(name: string, callback: (status: "start" | "stop") => void): Promise<void>;
    static getProcessCountAsync(): Promise<number>;
    static findByName(name: string): Promise<ProcessInfo[]>;
    static killByName(name: string, force?: boolean): Promise<boolean | unknown>;
    static killByPid(pid: number, force?: boolean): Promise<boolean | unknown>;
    static listProcesses(): Promise<ProcessInfo[]>;
}
export default class Taskmgr {
    static readonly async: typeof Async;
    static readonly sync: typeof Sync;
}
export {};
//# sourceMappingURL=taskmgr.d.ts.map