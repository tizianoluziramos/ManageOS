import { exec, execSync } from "child_process";
import * as path from "path";
class Sync {
    static createTask(config) {
        try {
            const script = `"${path.resolve(config.scriptPath)}"`;
            const args = config.args ? config.args.join(" ") : "";
            const time = config.time || "09:00";
            const command = `schtasks /Create /TN "${config.name}" /TR "${script} ${args}" /SC ${config.schedule} /ST ${time} /RL HIGHEST /F`;
            execSync(command, { stdio: "ignore" });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static list() {
        try {
            const output = execSync(`powershell "Get-ScheduledTask | Format-Table TaskName, State, NextRunTime -HideTableHeaders"`, { encoding: "utf-8" });
            const lines = output
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
            return lines.map((line) => {
                const [name, status, nextRunTime] = line.split(/\s{2,}/);
                return { name, status, nextRunTime };
            });
        }
        catch {
            return [];
        }
    }
    static run(taskName) {
        try {
            execSync(`schtasks /Run /TN "${taskName}"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
    static delete(taskName) {
        try {
            execSync(`schtasks /Delete /TN "${taskName}" /F`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || String(error) };
        }
    }
}
class Async {
    static createTask(config) {
        return new Promise((resolve) => {
            try {
                const script = `"${path.resolve(config.scriptPath)}"`;
                const args = config.args ? config.args.join(" ") : "";
                const time = config.time || "09:00";
                const command = `schtasks /Create /TN "${config.name}" /TR "${script} ${args}" /SC ${config.schedule} /ST ${time} /RL HIGHEST /F`;
                exec(command, (err) => {
                    if (err)
                        resolve({ success: false, error: err.message });
                    else
                        resolve({ success: true });
                });
            }
            catch (error) {
                resolve({ success: false, error: error.message || String(error) });
            }
        });
    }
    static list() {
        return new Promise((resolve) => {
            exec(`powershell "Get-ScheduledTask | Format-Table TaskName, State, NextRunTime -HideTableHeaders"`, { encoding: "utf-8" }, (err, stdout) => {
                if (err) {
                    resolve([]);
                    return;
                }
                const lines = stdout
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean);
                const tasks = lines.map((line) => {
                    const [name, status, nextRunTime] = line.split(/\s{2,}/);
                    return { name, status, nextRunTime };
                });
                resolve(tasks);
            });
        });
    }
    static run(taskName) {
        return new Promise((resolve) => {
            exec(`schtasks /Run /TN "${taskName}"`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
    static delete(taskName) {
        return new Promise((resolve) => {
            exec(`schtasks /Delete /TN "${taskName}" /F`, (err) => {
                if (err)
                    resolve({ success: false, error: err.message });
                else
                    resolve({ success: true });
            });
        });
    }
}
export default class Scheduler {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=scheduler.js.map