import { exec } from "node:child_process";
import { platform } from "node:os";

export default class Clipboard {
  static async read(): Promise<string | unknown> {
    return new Promise((resolve) => {
      if (platform() !== "win32") return resolve(new Error("Async read not implemented for this OS"));
      exec(`powershell Get-Clipboard`, { encoding: "utf8" }, (err, stdout) => {
        if (err) return resolve(err);
        resolve(stdout.replace(/\r\n$/, ""));
      });
    });
  }

  static async write(text: string): Promise<boolean | unknown> {
    return new Promise((resolve) => {
      if (platform() !== "win32") return resolve(new Error("Async write not implemented for this OS"));
      exec(`echo ${text.replace(/\n/g, "\r\n")} | clip`, (err) => {
        if (err) return resolve(err);
        resolve(true);
      });
    });
  }

  static async clear(): Promise<boolean | unknown> {
    return this.write("");
  }
}