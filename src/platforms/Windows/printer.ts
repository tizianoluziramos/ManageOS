import { exec, execSync } from "child_process";

interface PrinterInfo {
  Default: boolean;
  Name: string;
  Status: string;
}

class PrinterInstance {
  info: PrinterInfo;

  constructor(info: PrinterInfo) {
    this.info = info;
  }

  print(
    filePath: string,
    options: {
      pages?: string; // Ej: "1-3", "1,3,5"
      color?: boolean; // true = color, false = blanco y negro
      copies?: number; // cantidad de copias
      duplex?: boolean; // impresión a doble cara
      collate?: boolean; // ordenar
      quality?: string; // Ej: "high", "medium", "low"
    } = {}
  ): void {
    const { pages, color, copies, duplex, collate, quality } = options;

    let cmd = `rundll32 printui.dll,PrintUIEntry /y /n "${this.info.Name}" /if /f "${filePath}"`;

    if (copies) cmd += ` /c ${copies}`;
    if (pages) cmd += ` /p ${pages}`;
    if (color !== undefined) cmd += color ? " /color" : " /mono";
    if (duplex) cmd += " /duplex";
    if (collate) cmd += " /collate";
    if (quality) cmd += ` /q:${quality}`;

    execSync(cmd);
  }

  printTestPage(): void {
    execSync(`rundll32 printui.dll,PrintUIEntry /k /n "${this.info.Name}"`);
  }

  pause(): void {
    execSync(`wmic printer where name="${this.info.Name}" call pause`);
  }

  resume(): void {
    execSync(`wmic printer where name="${this.info.Name}" call resume`);
  }

  setDefault(): void {
    execSync(
      `wmic printer where name="${this.info.Name}" call setdefaultprinter`
    );
  }

  delete(): void {
    execSync(`rundll32 printui.dll,PrintUIEntry /dl /n "${this.info.Name}"`);
  }
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

class Async {
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

class Sync {
  static list(): PrinterInstance[] {
    const stdout = execSync("wmic printer get name,default,status").toString();
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

    return lines.map(
      (parts) =>
        new PrinterInstance({
          Default: parts[0].toLowerCase() === "true",
          Name: parts[1],
          Status: parts[2],
        })
    );
  }
}

export default class Printer {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
