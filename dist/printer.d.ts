interface PrinterInfo {
    Default: boolean;
    Name: string;
    Status: string;
}
declare class PrinterInstance {
    info: PrinterInfo;
    constructor(info: PrinterInfo);
    print(filePath: string, options?: {
        pages?: string;
        color?: boolean;
        copies?: number;
        duplex?: boolean;
        collate?: boolean;
        quality?: string;
    }): void;
    printTestPage(): void;
    pause(): void;
    resume(): void;
    setDefault(): void;
    delete(): void;
}
declare class AsyncPrinterInstance {
    info: PrinterInfo;
    constructor(info: PrinterInfo);
    print(filePath: string, options?: {
        pages?: string;
        color?: boolean;
        copies?: number;
        duplex?: boolean;
        collate?: boolean;
        quality?: string;
    }): Promise<void>;
    printTestPage(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    setDefault(): Promise<void>;
    delete(): Promise<void>;
}
declare class Async {
    static list(): Promise<AsyncPrinterInstance[]>;
}
declare class Sync {
    static list(): PrinterInstance[];
}
export default class Printer {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=printer.d.ts.map