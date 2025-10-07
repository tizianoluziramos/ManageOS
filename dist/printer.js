import { exec, execSync } from "child_process";
class PrinterInstance {
    info;
    constructor(info) {
        this.info = info;
    }
    print(filePath, options = {}) {
        const { pages, color, copies, duplex, collate, quality } = options;
        let cmd = `rundll32 printui.dll,PrintUIEntry /y /n "${this.info.Name}" /if /f "${filePath}"`;
        if (copies)
            cmd += ` /c ${copies}`;
        if (pages)
            cmd += ` /p ${pages}`;
        if (color !== undefined)
            cmd += color ? " /color" : " /mono";
        if (duplex)
            cmd += " /duplex";
        if (collate)
            cmd += " /collate";
        if (quality)
            cmd += ` /q:${quality}`;
        execSync(cmd);
    }
    printTestPage() {
        execSync(`rundll32 printui.dll,PrintUIEntry /k /n "${this.info.Name}"`);
    }
    pause() {
        execSync(`wmic printer where name="${this.info.Name}" call pause`);
    }
    resume() {
        execSync(`wmic printer where name="${this.info.Name}" call resume`);
    }
    setDefault() {
        execSync(`wmic printer where name="${this.info.Name}" call setdefaultprinter`);
    }
    delete() {
        execSync(`rundll32 printui.dll,PrintUIEntry /dl /n "${this.info.Name}"`);
    }
}
class AsyncPrinterInstance {
    info;
    constructor(info) {
        this.info = info;
    }
    print(filePath, options = {}) {
        const { pages, color, copies, duplex, collate, quality } = options;
        let cmd = `rundll32 printui.dll,PrintUIEntry /y /n "${this.info.Name}" /if /f "${filePath}"`;
        if (copies)
            cmd += ` /c ${copies}`;
        if (pages)
            cmd += ` /p ${pages}`;
        if (color !== undefined)
            cmd += color ? " /color" : " /mono";
        if (duplex)
            cmd += " /duplex";
        if (collate)
            cmd += " /collate";
        if (quality)
            cmd += ` /q:${quality}`;
        return new Promise((resolve, reject) => {
            exec(cmd, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    printTestPage() {
        return new Promise((resolve, reject) => {
            exec(`rundll32 printui.dll,PrintUIEntry /k /n "${this.info.Name}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    pause() {
        return new Promise((resolve, reject) => {
            exec(`wmic printer where name="${this.info.Name}" call pause`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    resume() {
        return new Promise((resolve, reject) => {
            exec(`wmic printer where name="${this.info.Name}" call resume`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    setDefault() {
        return new Promise((resolve, reject) => {
            exec(`wmic printer where name="${this.info.Name}" call setdefaultprinter`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    delete() {
        return new Promise((resolve, reject) => {
            exec(`rundll32 printui.dll,PrintUIEntry /dl /n "${this.info.Name}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}
class Async {
    static async list() {
        return new Promise((resolve, reject) => {
            exec("wmic printer get name,default,status", (error, stdout) => {
                if (error)
                    reject(error);
                else {
                    const lines = stdout
                        .trim()
                        .split("\n")
                        .slice(1)
                        .map((line) => line
                        .trim()
                        .split(/\s{2,}/)
                        .map((v) => v.trim()))
                        .filter((parts) => parts.length >= 3);
                    const printers = lines.map((parts) => new AsyncPrinterInstance({
                        Default: parts[0].toLowerCase() === "true",
                        Name: parts[1],
                        Status: parts[2],
                    }));
                    resolve(printers);
                }
            });
        });
    }
}
class Sync {
    static list() {
        const stdout = execSync("wmic printer get name,default,status").toString();
        const lines = stdout
            .trim()
            .split("\n")
            .slice(1)
            .map((line) => line
            .trim()
            .split(/\s{2,}/)
            .map((v) => v.trim()))
            .filter((parts) => parts.length >= 3);
        return lines.map((parts) => new PrinterInstance({
            Default: parts[0].toLowerCase() === "true",
            Name: parts[1],
            Status: parts[2],
        }));
    }
}
export default class Printer {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=printer.js.map