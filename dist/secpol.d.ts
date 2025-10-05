declare class Async {
    static validatePolicy(filePath: string): Promise<void>;
    static analyzePolicy(outputReport: string): Promise<void>;
    static resetPolicy(): Promise<void>;
    static applyPolicy(filePath: string): Promise<void>;
    static exportPolicy(outputPath: string): Promise<void>;
    static verifyPolicy(): Promise<void>;
}
declare class Sync {
    static validatePolicy(filePath: string): void;
    static analyzePolicy(outputReport: string): void;
    static resetPolicy(): void;
    static applyPolicy(filePath: string): void;
    static exportPolicy(outputPath: string): void;
    static verifyPolicy(): void;
}
export default class SecPol {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=secpol.d.ts.map