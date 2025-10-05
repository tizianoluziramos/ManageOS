declare class Async {
    static lock(): Promise<void>;
    static restart(): Promise<void>;
    static sleep(): Promise<void>;
    static shutdown(): Promise<void>;
}
declare class Sync {
    static lock(): void;
    static restart(): void;
    static sleep(): void;
    static shutdown(): void;
}
export default class Power {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=power.d.ts.map