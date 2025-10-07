interface ShellInfo {
    name: string;
    path?: string;
}
declare class ShellInstance {
    info: ShellInfo;
    constructor(info: ShellInfo);
    showPath(): string;
}
declare class AsyncShellInstance {
    info: ShellInfo;
    constructor(info: ShellInfo);
    showPath(): Promise<string>;
}
declare class SyncShell {
    static listShells(): ShellInstance[];
    static showPath(shell: string): string;
}
declare class AsyncShell {
    static listShells(): Promise<AsyncShellInstance[]>;
    static showPath(shell: string): Promise<string>;
}
declare class SyncWSL {
    static getPath(): string;
    static exists(): boolean;
    static getVersion(): string;
    static listDistributions(): string[];
    static runCommand(distribution: string, command: string): string;
    static terminate(distribution?: string): void;
}
declare class AsyncWSL {
    static getPath(): Promise<string>;
    static exists(): Promise<boolean>;
    static getVersion(): Promise<string>;
    static listDistributions(): Promise<string[]>;
    static runCommand(distribution: string, command: string): Promise<string>;
    static terminate(distribution?: string): Promise<void>;
}
export default class Shell {
    static readonly Sync: typeof SyncShell;
    static readonly Async: typeof AsyncShell;
    static readonly WSL: {
        Sync?: typeof SyncWSL;
        Async?: typeof AsyncWSL;
    };
    static initWSL(): void;
}
export {};
//# sourceMappingURL=shell.d.ts.map