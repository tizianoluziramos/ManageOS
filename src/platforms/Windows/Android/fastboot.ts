import { execSync, exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

interface FastbootDeviceInfo {
  serial: string;
  state: string;
}

interface FastbootVar {
  name: string;
  value: string;
}

type FastbootCommandResult = {
  success: boolean;
  command: string;
  output?: string;
  error?: string;
};

class Sync {
  static getFastbootPath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, "dependencies", "fastboot.exe");
  }

  static exec(serial: string, command: string): FastbootCommandResult {
    try {
      const fastboot = this.getFastbootPath();
      const cmd = `"${fastboot}" -s ${serial} ${command}`;
      const output = execSync(cmd, { encoding: "utf8" });
      return { success: true, command: cmd, output: output.trim() };
    } catch (error: any) {
      return { success: false, command: command, error: error.message };
    }
  }

  static listDevices(): FastbootDeviceInfo[] {
    try {
      const fastboot = this.getFastbootPath();
      const output = execSync(`"${fastboot}" devices`, { encoding: "utf8" });
      const lines = output.split("\n").filter((l) => l.trim());
      const devices: FastbootDeviceInfo[] = [];
      for (const line of lines) {
        const [serial, state] = line.split("\t");
        if (serial && state) {
          devices.push({ serial: serial.trim(), state: state.trim() });
        }
      }
      return devices;
    } catch {
      return [];
    }
  }

  static getVar(serial: string, variable: string): FastbootVar | null {
    const result = this.exec(serial, `getvar ${variable}`);
    if (result.success && result.output) {
      const match = result.output.match(new RegExp(`${variable}:\\s*(.+)`));
      if (match) {
        return { name: variable, value: match[1].trim() };
      }
    }
    return null;
  }

  static reboot(serial: string): FastbootCommandResult {
    return this.exec(serial, "reboot");
  }

  static rebootBootloader(serial: string): FastbootCommandResult {
    return this.exec(serial, "reboot bootloader");
  }

  static flash(
    serial: string,
    partition: string,
    filePath: string
  ): FastbootCommandResult {
    return this.exec(serial, `flash ${partition} "${filePath}"`);
  }

  static erase(serial: string, partition: string): FastbootCommandResult {
    return this.exec(serial, `erase ${partition}`);
  }

  static oemCommand(serial: string, command: string): FastbootCommandResult {
    return this.exec(serial, `oem ${command}`);
  }

  static continue(serial: string): FastbootCommandResult {
    return this.exec(serial, "continue");
  }

  static getFlashInfo(serial: string): Record<string, string> | null {
    const result = this.exec(serial, "getvar all");
    if (!result.success || !result.output) return null;

    const info: Record<string, string> = {};
    result.output.split("\n").forEach((line) => {
      const match = line.match(/^(\S+):\s*(.+)$/);
      if (match) {
        info[match[1]] = match[2];
      }
    });
    return Object.keys(info).length ? info : null;
  }

  static getVersion(serial: string): string | null {
    const result = this.getVar(serial, "version");
    return result?.value || null;
  }
}

class Async {
  static getFastbootPath(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, "dependencies", "fastboot.exe");
  }

  static exec(serial: string, command: string): Promise<FastbootCommandResult> {
    return new Promise((resolve) => {
      const fastboot = this.getFastbootPath();
      const cmd = `"${fastboot}" -s ${serial} ${command}`;
      exec(cmd, (error, stdout) => {
        if (error) {
          resolve({ success: false, command: command, error: error.message });
        } else {
          resolve({ success: true, command: cmd, output: stdout.trim() });
        }
      });
    });
  }

  static async listDevices(): Promise<FastbootDeviceInfo[]> {
    const fastboot = this.getFastbootPath();
    try {
      const output = await this.exec(fastboot, "devices");
      if (!output.output) return [];
      return output.output
        .split("\n")
        .filter((l) => l.trim())
        .map((line) => {
          const [serial, state] = line.split("\t");
          return { serial: serial.trim(), state: state.trim() };
        });
    } catch {
      return [];
    }
  }

  static async getVar(
    serial: string,
    variable: string
  ): Promise<FastbootVar | null> {
    const result = await this.exec(serial, `getvar ${variable}`);
    if (result.success && result.output) {
      const match = result.output.match(new RegExp(`${variable}:\\s*(.+)`));
      if (match) {
        return { name: variable, value: match[1].trim() };
      }
    }
    return null;
  }

  static reboot(serial: string) {
    return this.exec(serial, "reboot");
  }

  static rebootBootloader(serial: string) {
    return this.exec(serial, "reboot bootloader");
  }

  static flash(serial: string, partition: string, filePath: string) {
    return this.exec(serial, `flash ${partition} "${filePath}"`);
  }

  static erase(serial: string, partition: string) {
    return this.exec(serial, `erase ${partition}`);
  }

  static oemCommand(serial: string, command: string) {
    return this.exec(serial, `oem ${command}`);
  }

  static continue(serial: string) {
    return this.exec(serial, "continue");
  }

  static async getFlashInfo(
    serial: string
  ): Promise<Record<string, string> | null> {
    const result = await this.exec(serial, "getvar all");
    if (!result.success || !result.output) return null;
    const info: Record<string, string> = {};
    result.output.split("\n").forEach((line) => {
      const match = line.match(/^(\S+):\s*(.+)$/);
      if (match) {
        info[match[1]] = match[2];
      }
    });
    return Object.keys(info).length ? info : null;
  }

  static async getVersion(serial: string): Promise<string | null> {
    const result = await this.getVar(serial, "version");
    return result?.value || null;
  }
}

export default class Fastboot {
  static readonly Sync = Sync;
  static readonly Async = Async;
}
