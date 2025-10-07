import { execSync, exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
class Sync {
    static getFastbootPath() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return path.join(__dirname, "dependencies", "fastboot.exe");
    }
    static exec(serial, command) {
        try {
            const fastboot = this.getFastbootPath();
            const cmd = `"${fastboot}" -s ${serial} ${command}`;
            const output = execSync(cmd, { encoding: "utf8" });
            return { success: true, command: cmd, output: output.trim() };
        }
        catch (error) {
            return { success: false, command: command, error: error.message };
        }
    }
    static listDevices() {
        try {
            const fastboot = this.getFastbootPath();
            const output = execSync(`"${fastboot}" devices`, { encoding: "utf8" });
            const lines = output.split("\n").filter((l) => l.trim());
            const devices = [];
            for (const line of lines) {
                const [serial, state] = line.split("\t");
                if (serial && state) {
                    devices.push({ serial: serial.trim(), state: state.trim() });
                }
            }
            return devices;
        }
        catch {
            return [];
        }
    }
    static getVar(serial, variable) {
        const result = this.exec(serial, `getvar ${variable}`);
        if (result.success && result.output) {
            const match = result.output.match(new RegExp(`${variable}:\\s*(.+)`));
            if (match) {
                return { name: variable, value: match[1].trim() };
            }
        }
        return null;
    }
    static reboot(serial) {
        return this.exec(serial, "reboot");
    }
    static rebootBootloader(serial) {
        return this.exec(serial, "reboot bootloader");
    }
    static flash(serial, partition, filePath) {
        return this.exec(serial, `flash ${partition} "${filePath}"`);
    }
    static erase(serial, partition) {
        return this.exec(serial, `erase ${partition}`);
    }
    static oemCommand(serial, command) {
        return this.exec(serial, `oem ${command}`);
    }
    static continue(serial) {
        return this.exec(serial, "continue");
    }
    static getFlashInfo(serial) {
        const result = this.exec(serial, "getvar all");
        if (!result.success || !result.output)
            return null;
        const info = {};
        result.output.split("\n").forEach((line) => {
            const match = line.match(/^(\S+):\s*(.+)$/);
            if (match) {
                info[match[1]] = match[2];
            }
        });
        return Object.keys(info).length ? info : null;
    }
    static getVersion(serial) {
        const result = this.getVar(serial, "version");
        return result?.value || null;
    }
}
class Async {
    static getFastbootPath() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return path.join(__dirname, "dependencies", "fastboot.exe");
    }
    static exec(serial, command) {
        return new Promise((resolve) => {
            const fastboot = this.getFastbootPath();
            const cmd = `"${fastboot}" -s ${serial} ${command}`;
            exec(cmd, (error, stdout) => {
                if (error) {
                    resolve({ success: false, command: command, error: error.message });
                }
                else {
                    resolve({ success: true, command: cmd, output: stdout.trim() });
                }
            });
        });
    }
    static async listDevices() {
        const fastboot = this.getFastbootPath();
        try {
            const output = await this.exec(fastboot, "devices");
            if (!output.output)
                return [];
            return output.output
                .split("\n")
                .filter((l) => l.trim())
                .map((line) => {
                const [serial, state] = line.split("\t");
                return { serial: serial.trim(), state: state.trim() };
            });
        }
        catch {
            return [];
        }
    }
    static async getVar(serial, variable) {
        const result = await this.exec(serial, `getvar ${variable}`);
        if (result.success && result.output) {
            const match = result.output.match(new RegExp(`${variable}:\\s*(.+)`));
            if (match) {
                return { name: variable, value: match[1].trim() };
            }
        }
        return null;
    }
    static reboot(serial) {
        return this.exec(serial, "reboot");
    }
    static rebootBootloader(serial) {
        return this.exec(serial, "reboot bootloader");
    }
    static flash(serial, partition, filePath) {
        return this.exec(serial, `flash ${partition} "${filePath}"`);
    }
    static erase(serial, partition) {
        return this.exec(serial, `erase ${partition}`);
    }
    static oemCommand(serial, command) {
        return this.exec(serial, `oem ${command}`);
    }
    static continue(serial) {
        return this.exec(serial, "continue");
    }
    static async getFlashInfo(serial) {
        const result = await this.exec(serial, "getvar all");
        if (!result.success || !result.output)
            return null;
        const info = {};
        result.output.split("\n").forEach((line) => {
            const match = line.match(/^(\S+):\s*(.+)$/);
            if (match) {
                info[match[1]] = match[2];
            }
        });
        return Object.keys(info).length ? info : null;
    }
    static async getVersion(serial) {
        const result = await this.getVar(serial, "version");
        return result?.value || null;
    }
}
export default class Fastboot {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=fastboot.js.map