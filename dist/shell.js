import { execSync, exec as _exec } from "child_process";
import { promisify } from "util";
const exec = promisify(_exec);
function getDetectionCommand(name) {
    const safeName = name.replace(/'/g, "''");
    return `where.exe ${safeName} 2>nul`;
}
class ShellInstance {
    info;
    constructor(info) {
        this.info = info;
    }
    showPath() {
        if (this.info.path)
            return this.info.path;
        try {
            const out = execSync(getDetectionCommand(this.info.name), {
                encoding: "utf8",
            });
            return String(out).split(/\r?\n/)[0].trim();
        }
        catch {
            return "";
        }
    }
}
class AsyncShellInstance {
    info;
    constructor(info) {
        this.info = info;
    }
    async showPath() {
        if (this.info.path)
            return this.info.path;
        try {
            const { stdout } = (await exec(getDetectionCommand(this.info.name)));
            return stdout ? stdout.split(/\r?\n/)[0].trim() : "";
        }
        catch {
            return "";
        }
    }
}
class SyncShell {
    static listShells() {
        const shellsToCheck = [
            "cmd.exe",
            "powershell.exe",
            "pwsh.exe",
            "bash.exe",
            "zsh.exe",
            "wsl.exe",
        ];
        const found = [];
        for (const s of shellsToCheck) {
            try {
                const p = execSync(getDetectionCommand(s), { encoding: "utf8" })
                    .split(/\r?\n/)[0]
                    .trim();
                if (p)
                    found.push(new ShellInstance({ name: s, path: p }));
            }
            catch { }
        }
        return found;
    }
    static showPath(shell) {
        try {
            return execSync(getDetectionCommand(shell), { encoding: "utf8" })
                .split(/\r?\n/)[0]
                .trim();
        }
        catch {
            return "";
        }
    }
}
class AsyncShell {
    static async listShells() {
        const shellsToCheck = [
            "cmd.exe",
            "powershell.exe",
            "pwsh.exe",
            "bash.exe",
            "zsh.exe",
            "wsl.exe",
        ];
        const found = [];
        for (const s of shellsToCheck) {
            try {
                const { stdout } = (await exec(getDetectionCommand(s)));
                const p = stdout ? stdout.split(/\r?\n/)[0].trim() : "";
                if (p)
                    found.push(new AsyncShellInstance({ name: s, path: p }));
            }
            catch { }
        }
        return found;
    }
    static async showPath(shell) {
        try {
            const { stdout } = (await exec(getDetectionCommand(shell)));
            return stdout ? stdout.split(/\r?\n/)[0].trim() : "";
        }
        catch {
            return "";
        }
    }
}
class SyncWSL {
    static getPath() {
        return execSync(getDetectionCommand("wsl.exe"), {
            encoding: "utf8",
        }).trim();
    }
    static exists() {
        return !!this.getPath();
    }
    static getVersion() {
        return execSync("wsl.exe --version", { encoding: "utf8" }).trim();
    }
    static listDistributions() {
        const output = execSync("wsl.exe --list --quiet", { encoding: "utf8" });
        return output
            ? output
                .split(/\r?\n/)
                .map((d) => d.trim())
                .filter(Boolean)
            : [];
    }
    static runCommand(distribution, command) {
        return execSync(`wsl.exe -d ${distribution} -- ${command}`, {
            encoding: "utf8",
        }).trim();
    }
    static terminate(distribution) {
        if (distribution) {
            execSync(`wsl.exe --terminate ${distribution}`);
        }
        else {
            execSync(`wsl.exe --shutdown`);
        }
    }
}
class AsyncWSL {
    static async getPath() {
        const { stdout } = await exec(getDetectionCommand("wsl.exe"));
        return stdout.trim();
    }
    static async exists() {
        return !!(await this.getPath());
    }
    static async getVersion() {
        const { stdout } = await exec("wsl.exe --version");
        return stdout.trim();
    }
    static async listDistributions() {
        const { stdout } = await exec("wsl.exe --list --quiet");
        return stdout
            ? stdout
                .split(/\r?\n/)
                .map((d) => d.trim())
                .filter(Boolean)
            : [];
    }
    static async runCommand(distribution, command) {
        const { stdout } = await exec(`wsl.exe -d ${distribution} -- ${command}`);
        return stdout.trim();
    }
    static async terminate(distribution) {
        if (distribution) {
            await exec(`wsl.exe --terminate ${distribution}`);
        }
        else {
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
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
    },
});
const Async = new Proxy(AsyncShell, {
    get(target, prop) {
        const value = target[prop];
        return typeof value === "function" ? value.bind(target) : value;
    },
});
export default class Shell {
    static Sync = Sync;
    static Async = Async;
    static WSL = {};
    static initWSL() {
        try {
            const path = execSync(getDetectionCommand("wsl.exe"), {
                encoding: "utf8",
            }).trim();
            if (path) {
                this.WSL.Sync = SyncWSL;
                this.WSL.Async = AsyncWSL;
            }
        }
        catch { }
    }
}
//# sourceMappingURL=shell.js.map