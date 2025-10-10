declare class Async {
    static press(key: string): Promise<boolean>;
    static release(key: string): Promise<boolean>;
    static type(text: string): Promise<boolean>;
    static repeat(key: string, count: number): Promise<boolean>;
    static isKeyDown(key: string): Promise<boolean>;
    static block(): Promise<boolean>;
    static unblock(): Promise<boolean>;
}
declare class Sync {
    static press(key: string): boolean;
    static release(key: string): boolean;
    static type(text: string): boolean;
    static repeat(key: string, count: number): boolean;
    static isKeyDown(key: string): boolean;
    static block(): boolean;
    static unblock(): boolean;
}
export default class Keyboard {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=index.d.ts.map