import { exec, execSync } from "child_process";
// Parser por defecto: intenta parsear a JSON, si falla retorna texto crudo
function defaultParser(raw) {
    try {
        return JSON.parse(raw);
    }
    catch {
        return raw;
    }
}
function ensurePSWindowsUpdate(options = {}) {
    const { onInstallStart, onInstallSuccess, onInstallError, installCommand = 'powershell -Command "Install-Module -Name PSWindowsUpdate -Force -Confirm:$false"', } = options;
    return new Promise((resolve, reject) => {
        exec('powershell -Command "Get-Module -ListAvailable PSWindowsUpdate"', (error, stdout) => {
            if (error)
                return reject(error);
            if (!stdout || !stdout.includes("PSWindowsUpdate")) {
                if (onInstallStart)
                    onInstallStart();
                exec(installCommand, (installError) => {
                    if (installError) {
                        if (onInstallError)
                            onInstallError(installError);
                        return reject(installError);
                    }
                    if (onInstallSuccess)
                        onInstallSuccess();
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    });
}
class Async {
    static async listInstalled(parser = defaultParser) {
        return new Promise((resolve, reject) => {
            exec('powershell -Command "Get-HotFix | ConvertTo-Json -Compress"', (error, stdout, stderr) => {
                if (error)
                    return reject(error);
                resolve(parser(stdout || stderr || ""));
            });
        });
    }
    static async check(ensureOptions, parser = defaultParser) {
        await ensurePSWindowsUpdate(ensureOptions);
        return new Promise((resolve, reject) => {
            exec('powershell -Command "Get-WindowsUpdate | ConvertTo-Json -Compress"', (error, stdout, stderr) => {
                if (error)
                    return reject(error);
                resolve(parser(stdout || stderr || ""));
            });
        });
    }
    static async install(ensureOptions, parser = defaultParser) {
        await ensurePSWindowsUpdate(ensureOptions);
        return new Promise((resolve, reject) => {
            exec('powershell -Command "Install-WindowsUpdate -AcceptAll -AutoReboot | ConvertTo-Json -Compress"', (error, stdout, stderr) => {
                if (error)
                    return reject(error);
                resolve(parser(stdout || stderr || ""));
            });
        });
    }
    static async uninstall(updateId, ensureOptions) {
        await ensurePSWindowsUpdate(ensureOptions);
        return new Promise((resolve, reject) => {
            exec(`powershell -Command "wusa /uninstall /kb:${updateId} /quiet /norestart"`, (error, stdout, stderr) => {
                if (error)
                    return reject(error);
                resolve(stdout || stderr);
            });
        });
    }
}
class Sync {
    static listInstalled(parser = defaultParser) {
        const raw = execSync('powershell -Command "Get-HotFix | ConvertTo-Json -Compress"').toString();
        return parser(raw);
    }
    static ensure(options = {}) {
        const { onInstallStart, onInstallSuccess, onInstallError, installCommand = 'powershell -Command "Install-Module -Name PSWindowsUpdate -Force -Confirm:$false"', } = options;
        const result = execSync('powershell -Command "Get-Module -ListAvailable PSWindowsUpdate"').toString();
        if (!result.includes("PSWindowsUpdate")) {
            if (onInstallStart)
                onInstallStart();
            try {
                execSync(installCommand);
                if (onInstallSuccess)
                    onInstallSuccess();
            }
            catch (err) {
                if (onInstallError)
                    onInstallError(err);
                throw err;
            }
        }
    }
    static check(options, parser = defaultParser) {
        this.ensure(options);
        const raw = execSync('powershell -Command "Get-WindowsUpdate | ConvertTo-Json -Compress"').toString();
        return parser(raw);
    }
    static install(options, parser = defaultParser) {
        this.ensure(options);
        const raw = execSync('powershell -Command "Install-WindowsUpdate -AcceptAll -AutoReboot | ConvertTo-Json -Compress"').toString();
        return parser(raw);
    }
    static uninstall(updateId, options) {
        this.ensure(options);
        return execSync(`powershell -Command "wusa /uninstall /kb:${updateId} /quiet /norestart"`).toString();
    }
}
export default class WindowsUpdate {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=windowsupdate.js.map