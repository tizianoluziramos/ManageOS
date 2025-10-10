interface StartupEntry {
    Name: string;
    Command: string;
    Location: string;
}
declare class Async {
    static list(): Promise<StartupEntry[]>;
    static add(name: string, path: string): Promise<void>;
    static remove(name: string): Promise<void>;
}
declare class Sync {
    static list(): StartupEntry[];
    static add(name: string, path: string): void;
    static remove(name: string): void;
}
export default class Startup {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=startup.d.ts.map