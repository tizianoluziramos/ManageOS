import { exec, execSync } from "child_process";

class Async {
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
                  status: Antivirus.Sync.parseProductState(item.productState),
                }))
              : [
                  {
                    name: data.displayName,
                    status: Antivirus.Sync.parseProductState(data.productState),
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

class Sync {
  static getStatus(): { name: string; status: string }[] {
    try {
      const output = execSync(
        `powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName,productState | ConvertTo-Json"`
      ).toString();

      const data = JSON.parse(output);
      return Array.isArray(data)
        ? data.map((item) => ({
            name: item.displayName,
            status: Antivirus.Sync.parseProductState(item.productState),
          }))
        : [
            {
              name: data.displayName,
              status: Antivirus.Sync.parseProductState(data.productState),
            },
          ];
    } catch (error) {
      console.error("Error obteniendo estado antivirus:", error);
      return [];
    }
  }

  static listInstalled(): string[] {
    try {
      const output = execSync(
        `powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName | ConvertTo-Json"`
      ).toString();

      const data = JSON.parse(output);
      return Array.isArray(data)
        ? data.map((item) => item.displayName)
        : data.displayName
        ? [data.displayName]
        : [];
    } catch (error) {
      console.error("Error listando antivirus:", error);
      return [];
    }
  }

  static runQuickScan(): void {
    try {
      execSync(`powershell -Command "Start-MpScan -ScanType QuickScan"`);
    } catch (error) {
      console.error("Error ejecutando análisis rápido:", error);
    }
  }

  static parseProductState(state: number): string {
    switch (state) {
      case 266240:
        return "Active protection";
      case 393472:
        return "Disabled protection";
      default:
        return "Unknown state";
    }
  }
}

export default class Antivirus {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
