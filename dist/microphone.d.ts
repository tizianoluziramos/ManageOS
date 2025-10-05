type MicrophoneOptions = {
    rate?: number;
    channels?: number;
    threshold?: number;
    endian?: "big" | "little";
    bitwidth?: number;
    encoding?: "signed-integer" | "unsigned-integer";
    device?: string;
    fileType?: "raw" | "wav";
    debug?: boolean;
};
interface MicrophoneStatus {
    recording: boolean;
    paused: boolean;
    stopped: boolean;
}
declare class Async {
    private static micInstance;
    private static micStream;
    private static status;
    static start(options?: MicrophoneOptions, outputFile?: string): Promise<void>;
    static pause(): void;
    static resume(): void;
    static stop(): void;
    static getStatus(): MicrophoneStatus;
}
declare class Sync {
    static start(options?: MicrophoneOptions, outputFile?: string): void;
    static pause(): void;
    static resume(): void;
    static stop(): void;
    static getStatus(): MicrophoneStatus;
}
export default class Microphone {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=microphone.d.ts.map