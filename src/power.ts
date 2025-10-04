import { exec, execSync } from "child_process";

class Async {
  static lock(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("rundll32.exe user32.dll,LockWorkStation", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static restart(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("shutdown /r /t 0", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static sleep(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("rundll32.exe powrprof.dll,SetSuspendState 0,1,0", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("shutdown /s /t 0", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

class Sync {
  static lock(): void {
    execSync("rundll32.exe user32.dll,LockWorkStation");
  }

  static restart(): void {
    execSync("shutdown /r /t 0");
  }

  static sleep(): void {
    execSync("rundll32.exe powprof.dll,SetSuspendState 0,1,0");
  }

  static shutdown(): void {
    execSync("shutdown /s /t 0");
  }
}

export default class Power {
  public readonly Sync = Sync;
  public readonly Async = Async;
}
