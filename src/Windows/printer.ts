import { exec } from "child_process";

interface PrinterInfo {
  Default: boolean;
  Name: string;
  Status: string;
}

class AsyncPrinterInstance {
  info: PrinterInfo;

  constructor(info: PrinterInfo) {
    this.info = info;
  }

  print(
    filePath: string,
    options: {
      pages?: string;
      color?: boolean;
      copies?: number;
      duplex?: boolean;
      collate?: boolean;
      quality?: string;
    } = {}
  ): Promise<void> {
    const { pages, color, copies, duplex, collate, quality } = options;

    let cmd = `rundll32 printui.dll,PrintUIEntry /y /n "${this.info.Name}" /if /f "${filePath}"`;

    if (copies) cmd += ` /c ${copies}`;
    if (pages) cmd += ` /p ${pages}`;
    if (color !== undefined) cmd += color ? " /color" : " /mono";
    if (duplex) cmd += " /duplex";
    if (collate) cmd += " /collate";
    if (quality) cmd += ` /q:${quality}`;

    return new Promise((resolve, reject) => {
      exec(cmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  printTestPage(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `rundll32 printui.dll,PrintUIEntry /k /n "${this.info.Name}"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  pause(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `wmic printer where name="${this.info.Name}" call pause`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  resume(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `wmic printer where name="${this.info.Name}" call resume`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  setDefault(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `wmic printer where name="${this.info.Name}" call setdefaultprinter`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `rundll32 printui.dll,PrintUIEntry /dl /n "${this.info.Name}"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }
}

export default class Printer {
  static async list(): Promise<AsyncPrinterInstance[]> {
    return new Promise((resolve, reject) => {
      exec("wmic printer get name,default,status", (error, stdout) => {
        if (error) reject(error);
        else {
          const lines = stdout
            .trim()
            .split("\n")
            .slice(1)
            .map((line) =>
              line
                .trim()
                .split(/\s{2,}/)
                .map((v) => v.trim())
            )
            .filter((parts) => parts.length >= 3);

          const printers = lines.map(
            (parts) =>
              new AsyncPrinterInstance({
                Default: parts[0].toLowerCase() === "true",
                Name: parts[1],
                Status: parts[2],
              })
          );

          resolve(printers);
        }
      });
    });
  }
}
