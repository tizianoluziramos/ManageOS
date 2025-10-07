declare class Async {
    static get(policy?: string): Promise<string>;
    static set(category: string, setting: "Success" | "Failure" | "No Auditing" | "Success and Failure"): Promise<void>;
    static list(): Promise<string>;
    static backup(filePath: string): Promise<void>;
    static restore(filePath: string): Promise<void>;
    static clear(): Promise<void>;
    static remove(user?: string): Promise<void>;
}
declare class Sync {
    static get(policy?: string): string;
    static set(category: string, setting: "Success" | "Failure" | "No Auditing" | "Success and Failure"): void;
    static list(): string;
    static backup(filePath: string): void;
    static restore(filePath: string): void;
    static clear(): void;
    static remove(user?: string): void;
}
export default class AuditPolicy {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=auditpolicy.d.ts.map