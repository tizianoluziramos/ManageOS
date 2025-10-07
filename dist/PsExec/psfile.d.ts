export type PsFileOptions = {
    computer?: string;
    user?: string;
    password?: string;
    idOrPath?: string;
    close?: boolean;
    windowsHide?: boolean;
    timeout?: number;
};
declare class Async {
    static run(cmd?: string, options?: PsFileOptions): Promise<{
        stdout: string;
        stderr: string;
    }>;
    private static buildArgs;
}
declare class Sync {
    static run(cmd?: string, options?: PsFileOptions): {
        stdout: string;
        stderr: string;
        status: number | null;
    };
    private static buildArgs;
}
export default class PsFile {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=psfile.d.ts.map