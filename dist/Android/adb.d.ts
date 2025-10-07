interface StorageInfo {
    device: string;
    size: string;
    used: string;
    available: string;
    use: string;
    mount: string;
}
type PowerCommand = "shutdown" | "reboot" | "bootloader" | "fastbootd" | string;
interface PowerResult {
    success: boolean;
    command: string;
    error?: string;
}
type DeviceState = "device" | "offline" | "unauthorized" | "unknown";
interface DeviceInfo {
    serial: string;
    state: DeviceState;
}
declare class Sync {
    static getLocale(serial: string): {
        language: string;
        country: string;
    } | null;
    static clearAppData(serial: string, packageName: string): {
        success: boolean;
        command: string;
        output: string;
        error?: undefined;
    } | {
        success: boolean;
        command: string;
        error: any;
        output?: undefined;
    };
    static getUptime(serial: string): string | null;
    static isRooted(serial: string): boolean;
    static getCpuUsage(serial: string): string | null;
    static getTopApp(serial: string): {
        package: string;
        activity: string;
    } | null;
    static killProcess(serial: string, pid: number): {
        success: boolean;
        command: string;
        error?: undefined;
    } | {
        success: boolean;
        command: string;
        error: any;
    };
    static getProcesses(serial: string): Array<{
        pid: number;
        user: string;
        name: string;
    }> | null;
    static getNetworkInfo(serial: string): Record<string, string> | null;
    static getStorageInfo(serial: string): StorageInfo[] | null;
    static getMemoryInfo(serial: string): Record<string, string> | null;
    static exec(serial: string, command: string): {
        success: boolean;
        command: string;
        output?: string;
        error?: string;
    };
    static setScreenBrightness(serial: string, level: number): {
        success: boolean;
        command: string;
        error?: undefined;
    } | {
        success: boolean;
        command: string;
        error: any;
    };
    static getScreenBrightness(serial: string): number | null;
    static getScreenResolution(serial: string): {
        width: number;
        height: number;
    } | null;
    static screenshot(serial: string, remotePath: string): {
        success: boolean;
        command: string;
        error?: string;
    };
    static uninstallPackage(serial: string, packageName: string): {
        success: boolean;
        command: string;
        error?: string;
    };
    static getBatteryInfo(serial: string): Record<string, string> | null;
    static getAdbPath(): string;
    static getPackages(serial: string, systemOnly?: boolean): string[];
    static pushFile(serial: string, localPath: string, remotePath: string): {
        success: boolean;
        command: string;
        error?: undefined;
    } | {
        success: boolean;
        command: string;
        error: any;
    };
    static pullFile(serial: string, remotePath: string, localPath: string): {
        success: boolean;
        command: string;
        error?: undefined;
    } | {
        success: boolean;
        command: string;
        error: any;
    };
    static installApk(serial: string, apkPath: string, ...args: string[]): {
        success: boolean;
        command: string;
        error?: string;
    };
    static getModel(serial: string): string | null;
    static getBrand(serial: string): string | null;
    static getAndroidVersion(serial: string): string | null;
    static getSdkVersion(serial: string): string | null;
    static getDeviceProperties(serial: string): Record<string, boolean | number | string | null> | null;
    static power(serial: string, command: PowerCommand, customCommand?: string): PowerResult;
    static listDevices(): DeviceInfo[];
    static enableDeveloperMode(serial: string): {
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    };
}
declare class Async {
    static enableDeveloperMode(serial: string): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    static getLocale(serial: string): Promise<{
        language: string;
        country: string;
    } | null>;
    static clearAppData(serial: string, packageName: string): Promise<{
        success: boolean;
        command: string;
        output?: string;
        error?: string;
    }>;
    static getUptime(serial: string): Promise<string | null>;
    static isRooted(serial: string): Promise<boolean>;
    static getCpuUsage(serial: string): Promise<string | null>;
    static getTopApp(serial: string): Promise<{
        package: string;
        activity: string;
    } | null>;
    static killProcess(serial: string, pid: number): Promise<{
        success: boolean;
        command: string;
        error?: string;
    }>;
    static getProcesses(serial: string): Promise<Array<{
        pid: number;
        user: string;
        name: string;
    }> | null>;
    static getNetworkInfo(serial: string): Promise<Record<string, string> | null>;
    static getMemoryInfo(serial: string): Promise<unknown>;
    static getStorageInfo(serial: string): Promise<StorageInfo[] | null>;
    static exec(serial: string, command: string): Promise<{
        success: boolean;
        command: string;
        output?: string;
        error?: string;
    }>;
    static setScreenBrightness(serial: string, level: number): Promise<{
        success: boolean;
        command: string;
        error?: string;
    }>;
    static getScreenBrightness(serial: string): Promise<number | null>;
    static getScreenResolution(serial: string): Promise<{
        width: number;
        height: number;
    } | null>;
    static screenshot(serial: string, remotePath: string): Promise<PowerResult>;
    static uninstallPackage(serial: string, packageName: string): Promise<{
        success: boolean;
        command: string;
        error?: string;
    }>;
    static getBatteryInfo(serial: string): Promise<Record<string, string | number | boolean> | null>;
    static getPackages(serial: string, systemOnly?: boolean): Promise<string[]>;
    static pushFile(serial: string, localPath: string, remotePath: string, ...args: string[]): Promise<{
        success: boolean;
        command: string;
        error?: string;
    }>;
    static pullFile(serial: string, remotePath: string, localPath: string, ...args: string[]): Promise<{
        success: boolean;
        command: string;
        error?: string;
    }>;
    static installApk(serial: string, apkPath: string, ...args: string[]): Promise<{
        success: boolean;
        command: string;
        error?: string;
    }>;
    static getModel(serial: string): Promise<string | null>;
    static getBrand(serial: string): Promise<string | null>;
    static getAndroidVersion(serial: string): Promise<string | null>;
    static getSdkVersion(serial: string): Promise<string | null>;
    static getDeviceProperties(serial: string): Promise<Record<string, boolean | number | string | null> | null>;
    static power(serial: string, command: PowerCommand, customCommand?: string): Promise<PowerResult>;
    static listDevices(): Promise<DeviceInfo[]>;
}
export default class ADB {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=adb.d.ts.map