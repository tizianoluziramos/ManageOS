declare class Sync {
    static getVolume(): number | Error;
    static setVolume(volume: number): {
        success: boolean;
        error?: Error;
    };
    static isMuted(): boolean | Error;
    static mute(): {
        success: boolean;
        error?: Error;
    };
    static unmute(): {
        success: boolean;
        error?: Error;
    };
}
declare class Async {
    static getVolume(): Promise<number | Error>;
    static setVolume(volume: number): Promise<{
        success: boolean;
        error?: Error;
    }>;
    static isMuted(): Promise<boolean | Error>;
    static mute(): Promise<{
        success: boolean;
        error?: Error;
    }>;
    static unmute(): Promise<{
        success: boolean;
        error?: Error;
    }>;
}
export default class Audio {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=audio.d.ts.map