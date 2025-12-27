import { exec } from "child_process";

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

export default class USB {
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

