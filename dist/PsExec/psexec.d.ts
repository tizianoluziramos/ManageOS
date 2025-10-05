export type PsExecOptions = {
    computer?: string;
    fileList?: string;
    user?: string;
    password?: string;
    timeout?: number;
    limited?: boolean;
    system?: boolean;
    profile?: boolean;
    interactive?: boolean;
    session?: number;
    copy?: boolean;
    force?: boolean;
    versionCheck?: boolean;
    noWait?: boolean;
    workingDir?: string;
    priority?: "low" | "belownormal" | "abovenormal" | "high" | "realtime";
    processors?: number[];
    winlogon?: boolean;
    windowsHide?: boolean;
};
declare class Sync {
    static run(cmd: string, options?: PsExecOptions): {
        stdout: string;
        stderr: string;
        status: number | null;
    };
    private static buildArgs;
}
declare class Async {
    static run(cmd: string, options?: PsExecOptions): void;
    private static buildArgs;
}
export default class PsExec {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=psexec.d.ts.map