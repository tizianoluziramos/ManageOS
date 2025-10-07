interface FastbootDeviceInfo {
    serial: string;
    state: string;
}
interface FastbootVar {
    name: string;
    value: string;
}
type FastbootCommandResult = {
    success: boolean;
    command: string;
    output?: string;
    error?: string;
};
declare class Sync {
    static getFastbootPath(): string;
    static exec(serial: string, command: string): FastbootCommandResult;
    static listDevices(): FastbootDeviceInfo[];
    static getVar(serial: string, variable: string): FastbootVar | null;
    static reboot(serial: string): FastbootCommandResult;
    static rebootBootloader(serial: string): FastbootCommandResult;
    static flash(serial: string, partition: string, filePath: string): FastbootCommandResult;
    static erase(serial: string, partition: string): FastbootCommandResult;
    static oemCommand(serial: string, command: string): FastbootCommandResult;
    static continue(serial: string): FastbootCommandResult;
    static getFlashInfo(serial: string): Record<string, string> | null;
    static getVersion(serial: string): string | null;
}
declare class Async {
    static getFastbootPath(): string;
    static exec(serial: string, command: string): Promise<FastbootCommandResult>;
    static listDevices(): Promise<FastbootDeviceInfo[]>;
    static getVar(serial: string, variable: string): Promise<FastbootVar | null>;
    static reboot(serial: string): Promise<FastbootCommandResult>;
    static rebootBootloader(serial: string): Promise<FastbootCommandResult>;
    static flash(serial: string, partition: string, filePath: string): Promise<FastbootCommandResult>;
    static erase(serial: string, partition: string): Promise<FastbootCommandResult>;
    static oemCommand(serial: string, command: string): Promise<FastbootCommandResult>;
    static continue(serial: string): Promise<FastbootCommandResult>;
    static getFlashInfo(serial: string): Promise<Record<string, string> | null>;
    static getVersion(serial: string): Promise<string | null>;
}
export default class Fastboot {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=fastboot.d.ts.map