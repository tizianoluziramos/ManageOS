declare class USBDevice {
    name: string;
    id: string;
    private disconnectFn;
    private deviceInfoFn;
    private connectFn;
    constructor(name: string, id: string, disconnectFn: () => Promise<boolean> | boolean, deviceInfoFn: () => Promise<string> | string, connectFn: () => Promise<boolean> | boolean);
    disconnect(): boolean | Promise<boolean>;
    deviceInfo(): string | Promise<string>;
    connect(): boolean | Promise<boolean>;
}
declare class Async {
    static connect(deviceId: string): Promise<boolean>;
    static listDevices(): Promise<USBDevice[]>;
    static disconnect(deviceId: string): Promise<boolean>;
    static deviceInfo(deviceId: string): Promise<string>;
}
declare class Sync {
    static connect(deviceId: string): boolean;
    static listDevices(): USBDevice[];
    static disconnect(deviceId: string): boolean;
    static deviceInfo(deviceId: string): string;
}
export default class USB {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=usb.d.ts.map