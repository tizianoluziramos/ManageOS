import { exec, execSync } from "child_process";

class USBDevice {
  constructor(
    public name: string,
    public id: string,
    private disconnectFn: () => Promise<boolean> | boolean,
    private deviceInfoFn: () => Promise<string> | string,
    private connectFn: () => Promise<boolean> | boolean
  ) {}

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
  static async connect(deviceId: string): Promise<boolean> {
    return new Promise((resolve) => {
      exec(
        `powershell "Enable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`,
        (error) => resolve(!error)
      );
    });
  }

  static async listDevices(): Promise<USBDevice[]> {
    return new Promise((resolve) => {
      exec(
        `powershell "Get-PnpDevice -Class USB | Select-Object -Property FriendlyName, InstanceId | Format-Table -HideTableHeaders"`,
        (error, stdout) => {
          if (error) return resolve([]);
          const devices: USBDevice[] = [];
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

            devices.push(
              new USBDevice(
                name,
                id,
                async () => {
                  return new Promise((resolveDisconnect) => {
                    exec(
                      `powershell "Disable-PnpDevice -InstanceId '${id}' -Confirm:$false"`,
                      (err) => resolveDisconnect(!err)
                    );
                  });
                },
                async () => {
                  return new Promise((resolveInfo) => {
                    exec(
                      `powershell "Get-PnpDevice -InstanceId '${id}' | Format-List *"`,
                      (err, stdoutInfo) =>
                        resolveInfo(err ? "" : stdoutInfo.trim())
                    );
                  });
                },
                async () => {
                  return new Promise((resolveConnect) => {
                    exec(
                      `powershell "Enable-PnpDevice -InstanceId '${id}' -Confirm:$false"`,
                      (err) => resolveConnect(!err)
                    );
                  });
                }
              )
            );
          }
          resolve(devices);
        }
      );
    });
  }

  static async disconnect(deviceId: string): Promise<boolean> {
    return new Promise((resolve) => {
      exec(
        `powershell "Disable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`,
        (error) => resolve(!error)
      );
    });
  }

  static async deviceInfo(deviceId: string): Promise<string> {
    return new Promise((resolve) => {
      exec(
        `powershell "Get-PnpDevice -InstanceId '${deviceId}' | Format-List *"`,
        (error, stdout) => resolve(error ? "" : stdout.trim())
      );
    });
  }
}

class Sync {
  static connect(deviceId: string): boolean {
    try {
      execSync(
        `powershell "Enable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`,
        { stdio: "ignore" }
      );
      return true;
    } catch {
      return false;
    }
  }

  static listDevices(): USBDevice[] {
    try {
      const output = execSync(
        `powershell "Get-PnpDevice -Class USB | Select-Object -Property FriendlyName, InstanceId | Format-Table -HideTableHeaders"`,
        { encoding: "utf8" }
      ).trim();

      const devices: USBDevice[] = [];
      if (!output) return devices;

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

        devices.push(
          new USBDevice(
            name,
            id,
            () => {
              try {
                execSync(
                  `powershell "Disable-PnpDevice -InstanceId '${id}' -Confirm:$false"`,
                  { stdio: "ignore" }
                );
                return true;
              } catch {
                return false;
              }
            },
            () => {
              try {
                return execSync(
                  `powershell "Get-PnpDevice -InstanceId '${id}' | Format-List *"`,
                  { encoding: "utf8" }
                ).trim();
              } catch {
                return "";
              }
            },
            () => {
              try {
                execSync(
                  `powershell "Enable-PnpDevice -InstanceId '${id}' -Confirm:$false"`,
                  { stdio: "ignore" }
                );
                return true;
              } catch {
                return false;
              }
            }
          )
        );
      }
      return devices;
    } catch {
      return [];
    }
  }

  static disconnect(deviceId: string): boolean {
    try {
      execSync(
        `powershell "Disable-PnpDevice -InstanceId '${deviceId}' -Confirm:$false"`,
        { stdio: "ignore" }
      );
      return true;
    } catch {
      return false;
    }
  }

  static deviceInfo(deviceId: string): string {
    try {
      return execSync(
        `powershell "Get-PnpDevice -InstanceId '${deviceId}' | Format-List *"`,
        { encoding: "utf8" }
      ).trim();
    } catch {
      return "";
    }
  }
}

export default class USB {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
