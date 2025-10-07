declare class Async {
    static move(x: number, y: number): Promise<boolean>;
    static click(button?: "left" | "right"): Promise<boolean>;
    static doubleClick(): Promise<boolean>;
    static position(): Promise<{
        x: number;
        y: number;
    }>;
    static speed(value: number): Promise<boolean>;
    static getButtonState(): Promise<{
        left: boolean;
        right: boolean;
    }>;
    static hide(): Promise<boolean>;
    static show(): Promise<boolean>;
}
declare class Sync {
    static move(x: number, y: number): boolean;
    static click(button?: "left" | "right"): boolean;
    static doubleClick(): boolean;
    static position(): {
        x: number;
        y: number;
    };
    static speed(value: number): boolean;
    static getButtonState(): {
        left: boolean;
        right: boolean;
    };
    static hide(): boolean;
    static show(): boolean;
}
export default class Mouse {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=index.d.ts.map