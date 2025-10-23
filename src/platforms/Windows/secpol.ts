import { exec, execSync } from "child_process";

class Async {
  static validatePolicy(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`secedit /validate /cfg "${filePath}"`, (error, stdout, stderr) => {
        if (error) reject(stderr || error);
        else resolve();
      });
    });
  }

  static analyzePolicy(outputReport: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `secedit /analyze /db secedit.sdb /log "${outputReport}"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static resetPolicy(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `secedit /configure /cfg %windir%\\inf\\defltbase.inf /db secedit.sdb /overwrite`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }
  static applyPolicy(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `secedit /configure /db secedit.sdb /cfg "${filePath}" /overwrite`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }
  static exportPolicy(outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`secedit /export /cfg "${outputPath}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static verifyPolicy(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`secedit /analyze /db secedit.sdb`, (error, stdout, stderr) => {
        if (error) reject(stderr || error);
        else resolve();
      });
    });
  }
}

class Sync {
  static validatePolicy(filePath: string): void {
    execSync(`secedit /validate /cfg "${filePath}"`, { stdio: "inherit" });
  }

  static analyzePolicy(outputReport: string): void {
    execSync(`secedit /analyze /db secedit.sdb /log "${outputReport}"`);
  }

  static resetPolicy(): void {
    execSync(
      `secedit /configure /cfg %windir%\\inf\\defltbase.inf /db secedit.sdb /overwrite`
    );
  }

  static applyPolicy(filePath: string): void {
    execSync(
      `secedit /configure /db secedit.sdb /cfg "${filePath}" /overwrite`
    );
  }

  static exportPolicy(outputPath: string): void {
    execSync(`secedit /export /cfg "${outputPath}"`);
  }

  static verifyPolicy(): void {
    execSync(`secedit /analyze /db secedit.sdb`, { stdio: "inherit" });
  }
}

export default class SecPol {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
