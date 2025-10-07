type WebcamOptions = Record<string, any>;
interface DriverInfo {
    Status?: string;
    Class?: string;
    FriendlyName?: string;
    InstanceId?: string;
    Description?: string;
}
interface CameraInfo {
    name: string;
    device: string;
    resolution?: string;
    driver?: DriverInfo | DriverInfo[];
}
declare class Sync {
    static captureMultiple(baseFileName: string, count: number, options?: WebcamOptions): string[];
    static getCameraResolution(name: string): string;
    static checkCameraStatus(name: string): boolean;
    static capture(fileName: string, options?: WebcamOptions): string | Buffer;
    static listCameras(): CameraInfo[];
}
declare class Async {
    static captureMultiple(baseFileName: string, count: number, options?: WebcamOptions): Promise<string[]>;
    static getCameraResolution(name: string): Promise<string>;
    static checkCameraStatus(name: string): Promise<boolean>;
    static capture(fileName: string, options?: WebcamOptions): Promise<string | Buffer>;
    static listCameras(): Promise<CameraInfo[]>;
}
export default class Camera {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=camera.d.ts.map