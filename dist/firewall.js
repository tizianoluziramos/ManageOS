"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class Async {
    static runCommand(cmd) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`powershell -Command "${cmd}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static async addRule(rule) {
        try {
            const parts = [
                `-DisplayName "${rule.name}"`,
                `-Direction ${rule.direction || "Inbound"}`,
                `-Action ${rule.action || "Allow"}`,
            ];
            if (rule.protocol)
                parts.push(`-Protocol ${rule.protocol}`);
            if (rule.localPort)
                parts.push(`-LocalPort ${rule.localPort}`);
            if (rule.remoteAddress)
                parts.push(`-RemoteAddress ${rule.remoteAddress}`);
            const cmd = `New-NetFirewallRule ${parts.join(" ")}`;
            await this.runCommand(cmd);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static async removeRule(name) {
        try {
            const cmd = `Remove-NetFirewallRule -DisplayName "${name}"`;
            await this.runCommand(cmd);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static async listRules() {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`powershell -Command "Get-NetFirewallRule | Select-Object -ExpandProperty DisplayName"`, { encoding: "utf-8" }, (error, stdout) => {
                if (error) {
                    resolve({ success: false, error: error.message });
                    return;
                }
                const rules = stdout
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line);
                resolve({ success: true, rules });
            });
        });
    }
}
class Sync {
    static runCommand(cmd) {
        (0, child_process_1.execSync)(`powershell -Command "${cmd}"`, { stdio: "ignore" });
    }
    static addRule(rule) {
        try {
            const parts = [
                `-DisplayName "${rule.name}"`,
                `-Direction ${rule.direction || "Inbound"}`,
                `-Action ${rule.action || "Allow"}`,
            ];
            if (rule.protocol)
                parts.push(`-Protocol ${rule.protocol}`);
            if (rule.localPort)
                parts.push(`-LocalPort ${rule.localPort}`);
            if (rule.remoteAddress)
                parts.push(`-RemoteAddress ${rule.remoteAddress}`);
            const cmd = `New-NetFirewallRule ${parts.join(" ")}`;
            this.runCommand(cmd);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static removeRule(name) {
        try {
            const cmd = `Remove-NetFirewallRule -DisplayName "${name}"`;
            this.runCommand(cmd);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static listRules() {
        try {
            const output = (0, child_process_1.execSync)(`powershell -Command "Get-NetFirewallRule | Select-Object -ExpandProperty DisplayName"`, { encoding: "utf-8" });
            const rules = output
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line);
            return { success: true, rules };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
}
class Firewall {
    static Sync = Sync;
    static Async = Async;
}
exports.default = Firewall;
//# sourceMappingURL=firewall.js.map