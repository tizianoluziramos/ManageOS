export type PsInfoOptions = {
    computer?: string;
    user?: string;
    password?: string;
    showHotfixes?: boolean;
    showSoftware?: boolean;
    showDisk?: boolean;
    csv?: boolean;
    delimiter?: string;
    windowsHide?: boolean;
    timeout?: number;
};
declare class Async {
    static run(options?: PsInfoOptions): Promise<{
        stdout: string;
        stderr: string;
    }>;
    private static buildArgs;
}
declare class Sync {
    static run(options?: PsInfoOptions): {
        stdout: string;
        stderr: string;
        status: number | null;
    };
    private static buildArgs;
}
export default class PsInfo {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=psinfo.d.ts.map