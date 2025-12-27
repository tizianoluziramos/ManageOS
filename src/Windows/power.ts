import { exec } from "child_process";

export default class Power {
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