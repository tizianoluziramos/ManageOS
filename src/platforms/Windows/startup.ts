import { exec, execSync } from "child_process";

interface StartupEntry {
  Name: string;
  Command: string;
  Location: string;
}

class Async {
  static list(): Promise<StartupEntry[]> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -NoProfile -Command "try { Get-WmiObject -Class Win32_StartupCommand | Select-Object Name, Command, Location | ConvertTo-Json -Compress } catch { Write-Output '[]' }"`,
        (error, stdout) => {
          if (error) {
            reject(error);
            return;
          }
          try {
            const parsed: StartupEntry[] = JSON.parse(stdout.trim() || "[]");
            resolve(Array.isArray(parsed) ? parsed : [parsed]);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }

  static add(name: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -NoProfile -Command "try { New-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${name}' -Value '${path}' -PropertyType String } catch { exit 1 }"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static remove(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -NoProfile -Command "try { Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${name}' } catch { exit 1 }"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }
}

class Sync {
  static list(): StartupEntry[] {
    try {
      const stdout = execSync(
        `powershell -NoProfile -Command "try { Get-WmiObject -Class Win32_StartupCommand | Select-Object Name, Command, Location | ConvertTo-Json -Compress } catch { Write-Output '[]' }"`
      )
        .toString()
        .trim();

      const parsed: StartupEntry[] = JSON.parse(stdout || "[]");
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [];
    }
  }

  static add(name: string, path: string): void {
    try {
      execSync(
        `powershell -NoProfile -Command "try { New-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${name}' -Value '${path}' -PropertyType String } catch { exit 1 }"`
      );
    } catch (e) {}
  }

  static remove(name: string): void {
    try {
      execSync(
        `powershell -NoProfile -Command "try { Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name '${name}' } catch { exit 1 }"`
      );
    } catch (e) {}
  }
}

export default class Startup {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
