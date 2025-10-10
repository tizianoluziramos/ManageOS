interface ServerOptions {
    port: number;
    folder: string;
    blockedExt?: string[];
}
declare class Async {
    static start(options: ServerOptions): Promise<boolean>;
}
declare class Sync {
    static start(options: ServerOptions): boolean;
}
export default class HTTP {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=index.d.ts.map