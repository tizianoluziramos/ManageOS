import { execSync, exec as _exec } from "child_process";
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
  showPath(): string {
    if (this.info.path) return this.info.path;
    try {
      const out = execSync(getDetectionCommand(this.info.name), {
        encoding: "utf8",
      });
      return String(out).split(/\r?\n/)[0].trim();
    } catch {
      return "";
    }
  }
}

class AsyncShellInstance {
  constructor(public info: ShellInfo) {}
  async showPath(): Promise<string> {
    if (this.info.path) return this.info.path;
    try {
      const { stdout } = (await exec(getDetectionCommand(this.info.name))) as {
        stdout: string;
        stderr: string;
      };
      return stdout ? stdout.split(/\r?\n/)[0].trim() : "";
    } catch {
      return "";
    }
  }
}

class SyncShell {
  static listShells(): ShellInstance[] {
    const shellsToCheck = [
      "cmd.exe",
      "powershell.exe",
      "pwsh.exe",
      "bash.exe",
      "zsh.exe",
      "wsl.exe",
    ];
    const found: ShellInstance[] = [];
    for (const s of shellsToCheck) {
      try {
        const p = execSync(getDetectionCommand(s), { encoding: "utf8" })
          .split(/\r?\n/)[0]
          .trim();
        if (p) found.push(new ShellInstance({ name: s, path: p }));
      } catch {}
    }
    return found;
  }

  static showPath(shell: string): string {
    try {
      return execSync(getDetectionCommand(shell), { encoding: "utf8" })
        .split(/\r?\n/)[0]
        .trim();
    } catch {
      return "";
    }
  }
}

class AsyncShell {
  static async listShells(): Promise<AsyncShellInstance[]> {
    const shellsToCheck = [
      "cmd.exe",
      "powershell.exe",
      "pwsh.exe",
      "bash.exe",
      "zsh.exe",
      "wsl.exe",
    ];
    const found: AsyncShellInstance[] = [];
    for (const s of shellsToCheck) {
      try {
        const { stdout } = (await exec(getDetectionCommand(s))) as {
          stdout: string;
          stderr: string;
        };
        const p = stdout ? stdout.split(/\r?\n/)[0].trim() : "";
        if (p) found.push(new AsyncShellInstance({ name: s, path: p }));
      } catch {}
    }
    return found;
  }

  static async showPath(shell: string): Promise<string> {
    try {
      const { stdout } = (await exec(getDetectionCommand(shell))) as {
        stdout: string;
        stderr: string;
      };
      return stdout ? stdout.split(/\r?\n/)[0].trim() : "";
    } catch {
      return "";
    }
  }
}

class SyncWSL {
  static getPath(): string {
    return execSync(getDetectionCommand("wsl.exe"), {
      encoding: "utf8",
    }).trim();
  }
  static exists(): boolean {
    return !!this.getPath();
  }
  static getVersion(): string {
    return execSync("wsl.exe --version", { encoding: "utf8" }).trim();
  }
  static listDistributions(): string[] {
    const output = execSync("wsl.exe --list --quiet", { encoding: "utf8" });
    return output
      ? output
          .split(/\r?\n/)
          .map((d) => d.trim())
          .filter(Boolean)
      : [];
  }
  static runCommand(distribution: string, command: string): string {
    return execSync(`wsl.exe -d ${distribution} -- ${command}`, {
      encoding: "utf8",
    }).trim();
  }
  static terminate(distribution?: string): void {
    if (distribution) {
      execSync(`wsl.exe --terminate ${distribution}`);
    } else {
      execSync(`wsl.exe --shutdown`);
    }
  }
}

class AsyncWSL {
  static async getPath(): Promise<string> {
    const { stdout } = await exec(getDetectionCommand("wsl.exe"));
    return stdout.trim();
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
    const { stdout } = await exec(`wsl.exe -d ${distribution} -- ${command}`);
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

const Sync = new Proxy(SyncShell, {
  get(target, prop) {
    if (typeof prop === "string" && /^\d+$/.test(prop)) {
      const list = target.listShells();
      return list[Number(prop)];
    }
    const value = (target as any)[prop];
    return typeof value === "function" ? value.bind(target) : value;
  },
});

const Async = new Proxy(AsyncShell, {
  get(target, prop) {
    const value = (target as any)[prop];
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export default class Shell {
  public static readonly Sync = Sync;
  public static readonly Async = Async;

  public static readonly WSL: {
    Sync?: typeof SyncWSL;
    Async?: typeof AsyncWSL;
  } = {};

  static initWSL() {
    try {
      const path = execSync(getDetectionCommand("wsl.exe"), {
        encoding: "utf8",
      }).trim();
      if (path) {
        this.WSL.Sync = SyncWSL;
        this.WSL.Async = AsyncWSL;
      }
    } catch {}
  }
}
