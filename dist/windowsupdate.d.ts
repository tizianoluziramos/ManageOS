type EnsureOptions = {
    onInstallStart?: () => void;
    onInstallSuccess?: () => void;
    onInstallError?: (error: Error) => void;
    installCommand?: string;
};
export type Parser<T> = (raw: string) => T;
declare class Async {
    static listInstalled<T = any>(parser?: Parser<T>): Promise<T>;
    static check<T = any>(ensureOptions?: EnsureOptions, parser?: Parser<T>): Promise<T>;
    static install<T = any>(ensureOptions?: EnsureOptions, parser?: Parser<T>): Promise<T>;
    static uninstall(updateId: string, ensureOptions?: EnsureOptions): Promise<string>;
}
declare class Sync {
    static listInstalled<T = any>(parser?: Parser<T>): T;
    static ensure(options?: EnsureOptions): void;
    static check<T = any>(options?: EnsureOptions, parser?: Parser<T>): T;
    static install<T = any>(options?: EnsureOptions, parser?: Parser<T>): T;
    static uninstall(updateId: string, options?: EnsureOptions): string;
}
export default class WindowsUpdate {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=windowsupdate.d.ts.map