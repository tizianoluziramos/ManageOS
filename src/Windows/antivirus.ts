import { exec } from "child_process";

export default class Antivirus {
  static getStatus(): Promise<{ name: string; status: string }[]> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName,productState | ConvertTo-Json"`,
        (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          try {
            const data = JSON.parse(stdout);
            const result = Array.isArray(data)
              ? data.map((item) => ({
                  name: item.displayName,
                  status: item.productState,
                }))
              : [
                  {
                    name: data.displayName,
                    status: data.productState,
                  },
                ];
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  static listInstalled(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName | ConvertTo-Json"`,
        (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          try {
            const data = JSON.parse(stdout);
            const result = Array.isArray(data)
              ? data.map((item) => item.displayName)
              : data.displayName
              ? [data.displayName]
              : [];
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  }

  static runQuickScan(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -Command "Start-MpScan -ScanType QuickScan"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }
}