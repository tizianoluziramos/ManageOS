export type PsGetSidOptions = {
    computer?: string;
    user?: string;
    password?: string;
    account?: string;
    windowsHide?: boolean;
    timeout?: number;
};
declare class Async {
    static run(options?: PsGetSidOptions): Promise<{
        stdout: string;
        stderr: string;
    }>;
    private static buildArgs;
}
declare class Sync {
    static run(options?: PsGetSidOptions): {
        stdout: string;
        stderr: string;
        status: number | null;
    };
    private static buildArgs;
}
export default class PsGetSid {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=psgetsid.d.ts.map