declare class Async {
    static open(): Promise<void>;
    static list(store?: string): Promise<string>;
    static export(certName: string, outputPath: string, store?: string): Promise<void>;
    static import(filePath: string): Promise<void>;
    static delete(certName: string, store?: string): Promise<void>;
    static dump(filePath: string): Promise<string>;
    static verify(filePath: string): Promise<string>;
    static view(filePath: string): Promise<void>;
    static renew(certName: string, store?: string): Promise<void>;
    static generateSelfSigned(subject: string, outputPath: string): Promise<void>;
}
declare class Sync {
    static open(): void;
    static list(store?: string): string;
    static export(certName: string, outputPath: string, store?: string): void;
    static import(filePath: string): void;
    static delete(certName: string, store?: string): void;
    static dump(filePath: string): string;
    static verify(filePath: string): string;
    static view(filePath: string): void;
    static renew(certName: string, store?: string): void;
    static generateSelfSigned(subject: string, outputPath: string): void;
}
export default class Certificates {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=certificates.d.ts.map