"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const node_windows_1 = require("node-windows");
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
            const svc = new node_windows_1.Service(svcConfig);
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
            const output = (0, child_process_1.execSync)(`powershell "Get-Service | Select-Object -Property Name, Status | Format-Table -HideTableHeaders"`, { encoding: "utf-8" });
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
            (0, child_process_1.execSync)(`powershell Start-Service -Name "${serviceName}"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static stop(serviceName) {
        try {
            (0, child_process_1.execSync)(`powershell Stop-Service -Name "${serviceName}"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static restart(serviceName) {
        try {
            (0, child_process_1.execSync)(`powershell Restart-Service -Name "${serviceName}"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static enable(serviceName) {
        try {
            (0, child_process_1.execSync)(`powershell Set-Service -Name "${serviceName}" -StartupType Automatic`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static disable(serviceName) {
        try {
            (0, child_process_1.execSync)(`powershell Set-Service -Name "${serviceName}" -StartupType Disabled`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static status(serviceName) {
        try {
            const output = (0, child_process_1.execSync)(`powershell "(Get-Service -Name '${serviceName}').Status"`, { encoding: "utf-8" });
            return { status: output.trim() };
        }
        catch (error) {
            return { status: "unknown", error: error.message || String(error) };
        }
    }
    static install(scriptPath, serviceName, description = "Node.js Service") {
        try {
            const svc = new node_windows_1.Service({
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
            const svc = new node_windows_1.Service({
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
                const svc = new node_windows_1.Service(svcConfig);
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
            (0, child_process_1.exec)(`powershell "Get-Service | Select-Object -Property Name, Status | Format-Table -HideTableHeaders"`, { encoding: "utf-8" }, (err, stdout) => {
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
            (0, child_process_1.exec)(`powershell Start-Service -Name "${serviceName}"`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static stop(serviceName) {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`powershell Stop-Service -Name "${serviceName}"`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static restart(serviceName) {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`powershell Restart-Service -Name "${serviceName}"`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static enable(serviceName) {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`powershell Set-Service -Name "${serviceName}" -StartupType Automatic`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static disable(serviceName) {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`powershell Set-Service -Name "${serviceName}" -StartupType Disabled`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static status(serviceName) {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`powershell "(Get-Service -Name '${serviceName}').Status"`, { encoding: "utf-8" }, (err, stdout) => {
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
                const svc = new node_windows_1.Service({
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
                const svc = new node_windows_1.Service({
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
class Services {
    static Sync = Sync;
    static Async = Async;
}
exports.default = Services;
//# sourceMappingURL=services.js.map