import { exec } from "child_process";

export default class Msconfig {
  static open(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("start msconfig", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static listStartupApps(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec(
        'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"',
        { encoding: "utf8" },
        (error, stdout) => {
          if (error) reject(error);
          else {
            const lines = stdout
              .split("\n")
              .filter((line) => line.trim() !== "");
            resolve(lines);
          }
        }
      );
    });
  }

  static addStartupApp(name: string, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}" /t REG_SZ /d "${path}" /f`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static removeStartupApp(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}" /f`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static checkStartupApp(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      exec(
        `reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}"`,
        (error) => resolve(!error)
      );
    });
  }

  static getStartupAppPath(name: string): Promise<string | null> {
    return new Promise((resolve) => {
      exec(
        `reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}"`,
        { encoding: "utf8" },
        (error, stdout) => {
          if (error) return resolve(null);
          const match = stdout.match(/REG_SZ\s+(.+)/);
          resolve(match ? match[1].trim() : null);
        }
      );
    });
  }

  static backupStartupApps(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `reg export "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" "${filePath}" /y`,
        (error) => (error ? reject(error) : resolve())
      );
    });
  }

  static restoreStartupApps(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`reg import "${filePath}"`, (error) =>
        error ? reject(error) : resolve()
      );
    });
  }

  static clearStartupApps(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /f`,
        (error) => (error ? reject(error) : resolve())
      );
    });
  }

  static restartMsconfig(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("taskkill /f /im msconfig.exe && start msconfig", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static closeMsconfig(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("taskkill /f /im msconfig.exe", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

