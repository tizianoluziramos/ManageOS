declare class Async {
    static getStatus(): Promise<{
        name: string;
        status: string;
    }[]>;
    static listInstalled(): Promise<string[]>;
    static runQuickScan(): Promise<void>;
}
declare class Sync {
    static getStatus(): {
        name: string;
        status: string;
    }[];
    static listInstalled(): string[];
    static runQuickScan(): void;
    static parseProductState(state: number): string;
}
export default class Antivirus {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=antivirus.d.ts.map