import { exec, execSync } from "child_process";
class Async {
    static open() {
        return new Promise((resolve, reject) => {
            exec("start msconfig", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static listStartupApps() {
        return new Promise((resolve, reject) => {
            exec('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', { encoding: "utf8" }, (error, stdout) => {
                if (error)
                    reject(error);
                else {
                    const lines = stdout
                        .split("\n")
                        .filter((line) => line.trim() !== "");
                    resolve(lines);
                }
            });
        });
    }
    static addStartupApp(name, path) {
        return new Promise((resolve, reject) => {
            exec(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}" /t REG_SZ /d "${path}" /f`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static removeStartupApp(name) {
        return new Promise((resolve, reject) => {
            exec(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}" /f`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static checkStartupApp(name) {
        return new Promise((resolve) => {
            exec(`reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}"`, (error) => resolve(!error));
        });
    }
    static getStartupAppPath(name) {
        return new Promise((resolve) => {
            exec(`reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}"`, { encoding: "utf8" }, (error, stdout) => {
                if (error)
                    return resolve(null);
                const match = stdout.match(/REG_SZ\s+(.+)/);
                resolve(match ? match[1].trim() : null);
            });
        });
    }
    static backupStartupApps(filePath) {
        return new Promise((resolve, reject) => {
            exec(`reg export "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" "${filePath}" /y`, (error) => (error ? reject(error) : resolve()));
        });
    }
    static restoreStartupApps(filePath) {
        return new Promise((resolve, reject) => {
            exec(`reg import "${filePath}"`, (error) => error ? reject(error) : resolve());
        });
    }
    static clearStartupApps() {
        return new Promise((resolve, reject) => {
            exec(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /f`, (error) => (error ? reject(error) : resolve()));
        });
    }
    static restartMsconfig() {
        return new Promise((resolve, reject) => {
            exec("taskkill /f /im msconfig.exe && start msconfig", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static closeMsconfig() {
        return new Promise((resolve, reject) => {
            exec("taskkill /f /im msconfig.exe", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}
class Sync {
    static open() {
        execSync("start msconfig");
    }
    static listStartupApps() {
        try {
            const output = execSync('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run"', { encoding: "utf8" });
            return output.split("\n").filter((line) => line.trim() !== "");
        }
        catch (error) {
            console.error("Error listando apps de inicio:", error);
            return [];
        }
    }
    static addStartupApp(name, path) {
        try {
            execSync(`reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}" /t REG_SZ /d "${path}" /f`);
        }
        catch (error) {
            console.error("Error agregando app al inicio:", error);
        }
    }
    static removeStartupApp(name) {
        try {
            execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}" /f`);
        }
        catch (error) {
            console.error("Error eliminando app del inicio:", error);
        }
    }
    static checkStartupApp(name) {
        try {
            execSync(`reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}"`);
            return true;
        }
        catch {
            return false;
        }
    }
    static getStartupAppPath(name) {
        try {
            const output = execSync(`reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${name}"`, { encoding: "utf8" });
            const match = output.match(/REG_SZ\s+(.+)/);
            return match ? match[1].trim() : null;
        }
        catch {
            return null;
        }
    }
    static backupStartupApps(filePath) {
        try {
            execSync(`reg export "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" "${filePath}" /y`);
        }
        catch (error) {
            console.error("Error haciendo backup:", error);
        }
    }
    static restoreStartupApps(filePath) {
        try {
            execSync(`reg import "${filePath}"`);
        }
        catch (error) {
            console.error("Error restaurando backup:", error);
        }
    }
    static clearStartupApps() {
        try {
            execSync(`reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /f`);
        }
        catch (error) {
            console.error("Error limpiando apps de inicio:", error);
        }
    }
    static restartMsconfig() {
        try {
            execSync("taskkill /f /im msconfig.exe && start msconfig");
        }
        catch (error) {
            console.error("Error reiniciando msconfig:", error);
        }
    }
    static closeMsconfig() {
        try {
            execSync("taskkill /f /im msconfig.exe");
        }
        catch (error) {
            console.error("Error cerrando msconfig:", error);
        }
    }
}
export default class Msconfig {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=msconfig.js.map