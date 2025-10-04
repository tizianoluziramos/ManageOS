declare class Sync {
    static read(): string | unknown;
    static write(text: string): boolean | unknown;
    static clear(): boolean | unknown;
}
declare class Async {
    static read(): Promise<string | unknown>;
    static write(text: string): Promise<boolean | unknown>;
    static clear(): Promise<boolean | unknown>;
}
export default class Clipboard {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=clipboard.d.ts.map