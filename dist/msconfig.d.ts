declare class Async {
    static open(): Promise<void>;
    static listStartupApps(): Promise<string[]>;
    static addStartupApp(name: string, path: string): Promise<void>;
    static removeStartupApp(name: string): Promise<void>;
    static checkStartupApp(name: string): Promise<boolean>;
    static getStartupAppPath(name: string): Promise<string | null>;
    static backupStartupApps(filePath: string): Promise<void>;
    static restoreStartupApps(filePath: string): Promise<void>;
    static clearStartupApps(): Promise<void>;
    static restartMsconfig(): Promise<void>;
    static closeMsconfig(): Promise<void>;
}
declare class Sync {
    static open(): void;
    static listStartupApps(): string[];
    static addStartupApp(name: string, path: string): void;
    static removeStartupApp(name: string): void;
    static checkStartupApp(name: string): boolean;
    static getStartupAppPath(name: string): string | null;
    static backupStartupApps(filePath: string): void;
    static restoreStartupApps(filePath: string): void;
    static clearStartupApps(): void;
    static restartMsconfig(): void;
    static closeMsconfig(): void;
}
export default class Msconfig {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=msconfig.d.ts.map