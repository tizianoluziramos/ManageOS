import { exec, execSync } from "child_process";
class USBDevice {
    name;
    id;
    disconnectFn;
    deviceInfoFn;
    connectFn;
    constructor(name, id, disconnectFn, deviceInfoFn, connectFn) {
        this.name = name;
        this.id = id;
        this.disconnectFn = disconnectFn;
        this.deviceInfoFn = deviceInfoFn;
        this.connectFn = connectFn;
    }
    disconnect() {
        return this.disconnectFn();
    }
    deviceInfo() {
        return this.deviceInfoFn();
    }
    connect() {
        return this.connectFn();
    }
}
class Async {
    static async connect(deviceId) {
        return new Promise((resolve) => {
            exec(`powershell "Enable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`, (error) => resolve(!error));
        });
    }
    static async listDevices() {
        return new Promise((resolve) => {
            exec(`powershell "Get-PnpDevice -Class USB | Select-Object -Property FriendlyName, InstanceId | Format-Table -HideTableHeaders"`, (error, stdout) => {
                if (error)
                    return resolve([]);
                const devices = [];
                const lines = stdout
                    .split(/\r?\n/)
                    .map((l) => l.trim())
                    .filter(Boolean);
                for (const line of lines) {
                    const parts = line.match(/(.+)\s+([A-Z]:\\.+)$/);
                    const name = parts ? parts[1] : line.split(/\s{2,}/)[0];
                    const id = parts
                        ? parts[2]
                        : line
                            .split(/\s{2,}/)
                            .slice(1)
                            .join(" ");
                    devices.push(new USBDevice(name, id, async () => {
                        return new Promise((resolveDisconnect) => {
                            exec(`powershell "Disable-PnpDevice -InstanceId '${id}' -Confirm:$false"`, (err) => resolveDisconnect(!err));
                        });
                    }, async () => {
                        return new Promise((resolveInfo) => {
                            exec(`powershell "Get-PnpDevice -InstanceId '${id}' | Format-List *"`, (err, stdoutInfo) => resolveInfo(err ? "" : stdoutInfo.trim()));
                        });
                    }, async () => {
                        return new Promise((resolveConnect) => {
                            exec(`powershell "Enable-PnpDevice -InstanceId '${id}' -Confirm:$false"`, (err) => resolveConnect(!err));
                        });
                    }));
                }
                resolve(devices);
            });
        });
    }
    static async disconnect(deviceId) {
        return new Promise((resolve) => {
            exec(`powershell "Disable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`, (error) => resolve(!error));
        });
    }
    static async deviceInfo(deviceId) {
        return new Promise((resolve) => {
            exec(`powershell "Get-PnpDevice -InstanceId '${deviceId}' | Format-List *"`, (error, stdout) => resolve(error ? "" : stdout.trim()));
        });
    }
}
class Sync {
    static connect(deviceId) {
        try {
            execSync(`powershell "Enable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`, { stdio: "ignore" });
            return true;
        }
        catch {
            return false;
        }
    }
    static listDevices() {
        try {
            const output = execSync(`powershell "Get-PnpDevice -Class USB | Select-Object -Property FriendlyName, InstanceId | Format-Table -HideTableHeaders"`, { encoding: "utf8" }).trim();
            const devices = [];
            if (!output)
                return devices;
            const lines = output
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
            for (const line of lines) {
                const parts = line.match(/(.+)\s+([A-Z]:\\.+)$/);
                const name = parts ? parts[1] : line.split(/\s{2,}/)[0];
                const id = parts
                    ? parts[2]
                    : line
                        .split(/\s{2,}/)
                        .slice(1)
                        .join(" ");
                devices.push(new USBDevice(name, id, () => {
                    try {
                        execSync(`powershell "Disable-PnpDevice -InstanceId '${id}' -Confirm:$false"`, { stdio: "ignore" });
                        return true;
                    }
                    catch {
                        return false;
                    }
                }, () => {
                    try {
                        return execSync(`powershell "Get-PnpDevice -InstanceId '${id}' | Format-List *"`, { encoding: "utf8" }).trim();
                    }
                    catch {
                        return "";
                    }
                }, () => {
                    try {
                        execSync(`powershell "Enable-PnpDevice -InstanceId '${id}' -Confirm:$false"`, { stdio: "ignore" });
                        return true;
                    }
                    catch {
                        return false;
                    }
                }));
            }
            return devices;
        }
        catch {
            return [];
        }
    }
    static disconnect(deviceId) {
        try {
            execSync(`powershell "Disable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`, { stdio: "ignore" });
            return true;
        }
        catch {
            return false;
        }
    }
    static deviceInfo(deviceId) {
        try {
            return execSync(`powershell "Get-PnpDevice -InstanceId '${deviceId}' | Format-List *"`, { encoding: "utf8" }).trim();
        }
        catch {
            return "";
        }
    }
}
export default class USB {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=usb.js.map