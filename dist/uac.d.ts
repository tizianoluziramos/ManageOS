declare class Async {
    static isAdmin(): Promise<boolean>;
    static runAsAdmin(command: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    static elevateSelf(): Promise<{
        success: boolean;
        error?: string;
    }>;
}
declare class Sync {
    static isAdmin(): boolean;
    static runAsAdmin(command: string): {
        success: boolean;
        error?: string;
    };
    static elevateSelf(): {
        success: boolean;
        error?: string;
    };
}
export default class UAC {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=uac.d.ts.map