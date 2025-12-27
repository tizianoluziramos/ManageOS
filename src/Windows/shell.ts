import { exec as _exec } from "child_process";
import { promisify } from "util";

const exec = promisify(_exec);

interface ShellInfo {
  name: string;
  path?: string;
}

function getDetectionCommand(name: string) {
  const safeName = name.replace(/'/g, "''");
  return `where.exe ${safeName} 2>nul`;
}

class ShellInstance {
  constructor(public info: ShellInfo) {}

  async showPath(): Promise<string> {
    if (this.info.path) return this.info.path;
    try {
      const { stdout } = await exec(getDetectionCommand(this.info.name));
      return stdout ? stdout.split(/\r?\n/)[0].trim() : "";
    } catch {
      return "";
    }
  }
}

class Shell1 {
  private static readonly shellsToCheck = [
    "cmd.exe",
    "powershell.exe",
    "pwsh.exe",
    "bash.exe",
    "zsh.exe",
    "wsl.exe",
  ];

  static async listShells(): Promise<ShellInstance[]> {
    const found: ShellInstance[] = [];

    for (const s of this.shellsToCheck) {
      try {
        const { stdout } = await exec(getDetectionCommand(s));
        const p = stdout ? stdout.split(/\r?\n/)[0].trim() : "";
        if (p) found.push(new ShellInstance({ name: s, path: p }));
      } catch {}
    }

    return found;
  }

  static async showPath(shell: string): Promise<string> {
    try {
      const { stdout } = await exec(getDetectionCommand(shell));
      return stdout ? stdout.split(/\r?\n/)[0].trim() : "";
    } catch {
      return "";
    }
  }
}

/* =========================
   WSL (solo Async)
   ========================= */

class WSL {
  static async getPath(): Promise<string> {
    try {
      const { stdout } = await exec(getDetectionCommand("wsl.exe"));
      return stdout.trim();
    } catch {
      return "";
    }
  }

  static async exists(): Promise<boolean> {
    return !!(await this.getPath());
  }

  static async getVersion(): Promise<string> {
    const { stdout } = await exec("wsl.exe --version");
    return stdout.trim();
  }

  static async listDistributions(): Promise<string[]> {
    const { stdout } = await exec("wsl.exe --list --quiet");
    return stdout
      ? stdout
          .split(/\r?\n/)
          .map((d) => d.trim())
          .filter(Boolean)
      : [];
  }

  static async runCommand(
    distribution: string,
    command: string
  ): Promise<string> {
    const { stdout } = await exec(
      `wsl.exe -d ${distribution} -- ${command}`
    );
    return stdout.trim();
  }

  static async terminate(distribution?: string): Promise<void> {
    if (distribution) {
      await exec(`wsl.exe --terminate ${distribution}`);
    } else {
      await exec(`wsl.exe --shutdown`);
    }
  }
}

export default class Shell {
  public static readonly Shell = Shell;
  public static readonly WSL = WSL;
}
