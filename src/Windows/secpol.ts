import { exec } from "child_process";

export default class SecPol {
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

