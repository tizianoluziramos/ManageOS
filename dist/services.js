import { exec, execSync } from "child_process";
import * as path from "path";
import { Service } from "node-windows";
class Sync {
    static createService(config) {
        try {
            const svcConfig = {
                name: config.name,
                description: config.description || "Node.js Service",
                script: path.resolve(config.scriptPath),
                cwd: config.cwd || path.dirname(config.scriptPath),
            };
            if (config.userName) {
                svcConfig.user = {
                    account: config.userName,
                    password: config.password || "",
                };
            }
            if (config.args && config.args.length) {
                svcConfig.env = config.args.map((arg, index) => ({
                    name: `ARG${index}`,
                    value: arg,
                }));
            }
            const svc = new Service(svcConfig);
            svc.on("install", () => svc.start());
            svc.on("error", (err) => { });
            svc.install();
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static list() {
        try {
            const output = execSync(`powershell "Get-Service | Select-Object -Property Name, Status | Format-Table -HideTableHeaders"`, { encoding: "utf-8" });
            const lines = output
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0);
            return lines.map((line) => {
                const [name, ...statusParts] = line.split(/\s{2,}/);
                return { name, status: statusParts.join(" ") };
            });
        }
        catch {
            return [];
        }
    }
    static start(serviceName) {
        try {
            execSync(`powershell Start-Service -Name "${serviceName}"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static stop(serviceName) {
        try {
            execSync(`powershell Stop-Service -Name "${serviceName}"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static restart(serviceName) {
        try {
            execSync(`powershell Restart-Service -Name "${serviceName}"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static enable(serviceName) {
        try {
            execSync(`powershell Set-Service -Name "${serviceName}" -StartupType Automatic`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static disable(serviceName) {
        try {
            execSync(`powershell Set-Service -Name "${serviceName}" -StartupType Disabled`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static status(serviceName) {
        try {
            const output = execSync(`powershell "(Get-Service -Name '${serviceName}').Status"`, { encoding: "utf-8" });
            return { status: output.trim() };
        }
        catch (error) {
            return { status: "unknown", error: error.message || String(error) };
        }
    }
    static install(scriptPath, serviceName, description = "Node.js Service") {
        try {
            const svc = new Service({
                name: serviceName,
                description,
                script: path.resolve(scriptPath),
            });
            svc.on("install", () => svc.start());
            svc.install();
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static uninstall(serviceName) {
        try {
            const svc = new Service({
                name: serviceName,
                script: "C:\\Windows\\System32\\cmd.exe",
            });
            svc.on("uninstall", () => { });
            svc.uninstall();
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
}
class Async {
    static createService(config) {
        return new Promise((resolve) => {
            try {
                const svcConfig = {
                    name: config.name,
                    description: config.description || "Node.js Service",
                    script: path.resolve(config.scriptPath),
                    cwd: config.cwd || path.dirname(config.scriptPath),
                };
                if (config.userName) {
                    svcConfig.user = {
                        account: config.userName,
                        password: config.password || "",
                    };
                }
                if (config.args && config.args.length) {
                    svcConfig.env = config.args.map((arg, index) => ({
                        name: `ARG${index}`,
                        value: arg,
                    }));
                }
                const svc = new Service(svcConfig);
                svc.on("install", () => svc.start());
                svc.on("error", (err) => resolve({ success: false, error: err.message }));
                svc.install();
                resolve({ success: true });
            }
            catch (error) {
                resolve({ success: false, error: error.message || String(error) });
            }
        });
    }
    static list() {
        return new Promise((resolve) => {
            exec(`powershell "Get-Service | Select-Object -Property Name, Status | Format-Table -HideTableHeaders"`, { encoding: "utf-8" }, (err, stdout) => {
                if (err) {
                    resolve([]);
                    return;
                }
                const lines = stdout
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0);
                const services = lines.map((line) => {
                    const [name, ...statusParts] = line.split(/\s{2,}/);
                    return { name, status: statusParts.join(" ") };
                });
                resolve(services);
            });
        });
    }
    static start(serviceName) {
        return new Promise((resolve) => {
            exec(`powershell Start-Service -Name "${serviceName}"`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static stop(serviceName) {
        return new Promise((resolve) => {
            exec(`powershell Stop-Service -Name "${serviceName}"`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static restart(serviceName) {
        return new Promise((resolve) => {
            exec(`powershell Restart-Service -Name "${serviceName}"`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static enable(serviceName) {
        return new Promise((resolve) => {
            exec(`powershell Set-Service -Name "${serviceName}" -StartupType Automatic`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static disable(serviceName) {
        return new Promise((resolve) => {
            exec(`powershell Set-Service -Name "${serviceName}" -StartupType Disabled`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static status(serviceName) {
        return new Promise((resolve) => {
            exec(`powershell "(Get-Service -Name '${serviceName}').Status"`, { encoding: "utf-8" }, (err, stdout) => {
                if (err)
                    resolve({ status: "unknown", error: err.message });
                else
                    resolve({ status: stdout.trim() });
            });
        });
    }
    static install(scriptPath, serviceName, description = "Node.js Service") {
        return new Promise((resolve) => {
            try {
                const svc = new Service({
                    name: serviceName,
                    description,
                    script: path.resolve(scriptPath),
                });
                svc.on("install", () => svc.start());
                svc.on("error", (err) => resolve({ success: false, error: err.message }));
                svc.install();
                resolve({ success: true });
            }
            catch (error) {
                resolve({ success: false, error: error.message || String(error) });
            }
        });
    }
    static uninstall(serviceName) {
        return new Promise((resolve) => {
            try {
                const svc = new Service({
                    name: serviceName,
                    script: "C:\\Windows\\System32\\cmd.exe",
                });
                svc.on("uninstall", () => resolve({ success: true }));
                svc.on("error", (err) => resolve({ success: false, error: err.message }));
                svc.uninstall();
            }
            catch (error) {
                resolve({ success: false, error: error.message || String(error) });
            }
        });
    }
}
export default class Services {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=services.js.map