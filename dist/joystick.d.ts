export interface JoystickDevice {
    vendorId: number;
    productId: number;
    path: string;
    product: string;
    usagePage?: number;
    usage?: number;
}
export type JoystickDataCallback = (data: Buffer) => void;
declare class Async {
    static scan(): Promise<JoystickDevice[]>;
    static listen(deviceInfo: JoystickDevice, callback: JoystickDataCallback): Promise<void>;
    static sendInput(deviceInfo: JoystickDevice, inputData: number[]): Promise<void>;
}
declare class Sync {
    static scan(): JoystickDevice[];
    static listen(deviceInfo: JoystickDevice, callback: JoystickDataCallback): void;
    static sendInput(deviceInfo: JoystickDevice, inputData: number[]): void;
}
export default class Joystick {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=joystick.d.ts.map