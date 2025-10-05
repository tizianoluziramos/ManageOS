import { exec, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import util from "util";
const execAsync = util.promisify(exec);
class Sync {
    static getLocale(serial) {
        try {
            const adb = this.getAdbPath();
            const lang = execSync(`"${adb}" -s ${serial} shell getprop persist.sys.locale`, { encoding: "utf8" }).trim();
            if (!lang.includes("-"))
                return null;
            const [language, country] = lang.split("-");
            return { language, country };
        }
        catch {
            return null;
        }
    }
    static clearAppData(serial, packageName) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} shell pm clear ${packageName}`;
            const output = execSync(cmd, { encoding: "utf8" });
            const success = /Success/i.test(output);
            return { success, command: cmd, output: output.trim() };
        }
        catch (error) {
            return { success: false, command: "clearAppData", error: error.message };
        }
    }
    static getUptime(serial) {
        try {
            const adb = this.getAdbPath();
            const output = execSync(`"${adb}" -s ${serial} shell uptime`, {
                encoding: "utf8",
            });
            return output.trim();
        }
        catch {
            return null;
        }
    }
    static isRooted(serial) {
        try {
            const adb = this.getAdbPath();
            const output = execSync(`"${adb}" -s ${serial} shell which su`, {
                encoding: "utf8",
            });
            return output.trim().length > 0;
        }
        catch {
            return false;
        }
    }
    static getCpuUsage(serial) {
        try {
            const adb = this.getAdbPath();
            const output = execSync(`"${adb}" -s ${serial} shell top -n 1 -b`, {
                encoding: "utf8",
            });
            const cpuMatch = output.match(/CPU usage:\s+(.*)%/i);
            return cpuMatch ? cpuMatch[1].trim() + "%" : null;
        }
        catch {
            return null;
        }
    }
    static getTopApp(serial) {
        try {
            const adb = this.getAdbPath();
            const output = execSync(`"${adb}" -s ${serial} shell dumpsys window windows | grep -E 'mCurrentFocus'`, { encoding: "utf8" });
            const match = output.match(/Window\{.*\s([^\s\/]+)\/([^\s}]+)\}/);
            if (!match)
                return null;
            return { package: match[1], activity: match[2] };
        }
        catch {
            return null;
        }
    }
    static killProcess(serial, pid) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} shell kill ${pid}`;
            execSync(cmd);
            return { success: true, command: cmd };
        }
        catch (error) {
            return { success: false, command: "kill", error: error.message };
        }
    }
    static getProcesses(serial) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} shell ps -A`;
            const output = execSync(cmd, { encoding: "utf8" });
            const lines = output.trim().split("\n").slice(1);
            return lines.map((line) => {
                const parts = line.trim().split(/\s+/);
                return {
                    user: parts[0],
                    pid: Number(parts[1]),
                    name: parts.slice(-1)[0],
                };
            });
        }
        catch {
            return null;
        }
    }
    static getNetworkInfo(serial) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} shell ip addr show wlan0`;
            const output = execSync(cmd, { encoding: "utf8" });
            const info = {};
            const ipMatch = output.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
            if (ipMatch)
                info["ip_address"] = ipMatch[1];
            const macMatch = output.match(/link\/ether\s+([0-9a-f:]+)/i);
            if (macMatch)
                info["mac_address"] = macMatch[1];
            info["interface"] = "wlan0";
            return info;
        }
        catch {
            return null;
        }
    }
    static getStorageInfo(serial) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} shell df -h`;
            const stdout = execSync(cmd, { encoding: "utf8" });
            const lines = stdout.trim().split("\n");
            if (lines.length < 2)
                return null;
            const data = lines.slice(1).map((line) => {
                const parts = line.split(/\s+/);
                return {
                    device: parts[0] || "",
                    size: parts[1] || "",
                    used: parts[2] || "",
                    available: parts[3] || "",
                    use: parts[4] || "",
                    mount: parts[5] || "",
                };
            });
            return data.length ? data : null;
        }
        catch {
            return null;
        }
    }
    static getMemoryInfo(serial) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} shell cat /proc/meminfo`;
            const stdout = execSync(cmd, { encoding: "utf8" });
            const memInfo = {};
            stdout.split("\n").forEach((line) => {
                const parts = line.split(":");
                if (parts.length === 2) {
                    memInfo[parts[0].trim()] = parts[1].trim();
                }
            });
            return Object.keys(memInfo).length ? memInfo : null;
        }
        catch {
            return null;
        }
    }
    static exec(serial, command) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const adbPath = path.join(__dirname, "dependencies", "adb.exe");
            const cmd = `"${adbPath}" -s ${serial} ${command}`;
            const output = execSync(cmd, { encoding: "utf8" }).toString();
            return { success: true, command: cmd, output: output.trim() };
        }
        catch (error) {
            return { success: false, command: command, error: error.message };
        }
    }
    static setScreenBrightness(serial, level) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} shell settings put system screen_brightness ${level}`;
            execSync(cmd);
            return { success: true, command: cmd };
        }
        catch (error) {
            return {
                success: false,
                command: "setScreenBrightness",
                error: error.message,
            };
        }
    }
    static getScreenBrightness(serial) {
        try {
            const adb = this.getAdbPath();
            const output = execSync(`"${adb}" -s ${serial} shell settings get system screen_brightness`, { encoding: "utf8" });
            return Number(output.trim());
        }
        catch {
            return null;
        }
    }
    static getScreenResolution(serial) {
        try {
            const adb = this.getAdbPath();
            const output = execSync(`"${adb}" -s ${serial} shell wm size`, {
                encoding: "utf8",
            })
                .replace("Physical size: ", "")
                .trim();
            const match = output.match(/^(\d+)x(\d+)$/);
            if (!match)
                return null;
            return { width: Number(match[1]), height: Number(match[2]) };
        }
        catch {
            return null;
        }
    }
    static screenshot(serial, remotePath) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const adbPath = path.join(__dirname, "dependencies", "adb.exe");
            const cmd = `"${adbPath}" -s ${serial} shell screencap -p "${remotePath}"`;
            execSync(cmd, { stdio: "ignore" });
            return { success: true, command: cmd };
        }
        catch (error) {
            return { success: false, command: "screenshot", error: error.message };
        }
    }
    static uninstallPackage(serial, packageName) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const adbPath = path.join(__dirname, "dependencies", "adb.exe");
            const cmd = `"${adbPath}" -s ${serial} shell pm uninstall "${packageName}"`;
            const output = execSync(cmd, {
                encoding: "utf8",
                stdio: "pipe",
            }).toString();
            const success = /Success/i.test(output);
            return {
                success,
                command: cmd,
                error: success ? undefined : output.trim(),
            };
        }
        catch (error) {
            return {
                success: false,
                command: "uninstall",
                error: error.message,
            };
        }
    }
    static getBatteryInfo(serial) {
        try {
            const adb = this.getAdbPath();
            const output = execSync(`"${adb}" -s ${serial} shell dumpsys battery`, {
                encoding: "utf8",
            });
            const info = {};
            output.split("\n").forEach((line) => {
                const match = line.trim().match(/^(\S+):\s*(.+)$/);
                if (match)
                    info[match[1]] = match[2];
            });
            return info;
        }
        catch {
            return null;
        }
    }
    static getAdbPath() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        return path.join(__dirname, "dependencies", "adb.exe");
    }
    static getPackages(serial, systemOnly = false) {
        try {
            const adb = this.getAdbPath();
            const flag = systemOnly ? "-s" : "";
            const output = execSync(`"${adb}" -s ${serial} shell pm list packages ${flag}`, {
                encoding: "utf8",
            });
            return output
                .split("\n")
                .map((l) => l.replace("package:", "").trim())
                .filter(Boolean);
        }
        catch {
            return [];
        }
    }
    static pushFile(serial, localPath, remotePath) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} push "${localPath}" "${remotePath}"`;
            execSync(cmd, { stdio: "pipe" });
            return { success: true, command: cmd };
        }
        catch (error) {
            return { success: false, command: "push", error: error.message };
        }
    }
    static pullFile(serial, remotePath, localPath) {
        try {
            const adb = this.getAdbPath();
            const cmd = `"${adb}" -s ${serial} pull "${remotePath}" "${localPath}"`;
            execSync(cmd, { stdio: "pipe" });
            return { success: true, command: cmd };
        }
        catch (error) {
            return { success: false, command: "pull", error: error.message };
        }
    }
    static installApk(serial, apkPath, ...args) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const adbPath = path.join(__dirname, "dependencies", "adb.exe");
            // Construir el comando con argumentos extra
            const params = args.length ? args.join(" ") : "";
            const cmd = `"${adbPath}" -s ${serial} install ${params} "${apkPath}"`;
            const output = execSync(cmd, { encoding: "utf8", stdio: "pipe" });
            const success = /Success/i.test(output);
            return {
                success,
                command: cmd,
                error: success ? undefined : output.trim(),
            };
        }
        catch (error) {
            return {
                success: false,
                command: "install",
                error: error.message,
            };
        }
    }
    static getModel(serial) {
        const props = this.getDeviceProperties(serial);
        return props?.["ro.product.model"] || null;
    }
    static getBrand(serial) {
        const props = this.getDeviceProperties(serial);
        return props?.["ro.product.brand"] || null;
    }
    static getAndroidVersion(serial) {
        const props = this.getDeviceProperties(serial);
        return props?.["ro.build.version.release"] || null;
    }
    static getSdkVersion(serial) {
        const props = this.getDeviceProperties(serial);
        return props?.["ro.build.version.sdk"] || null;
    }
    static getDeviceProperties(serial) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const adbPath = path.join(__dirname, "dependencies", "adb.exe");
            const stdout = execSync(`"${adbPath}" -s ${serial} shell getprop`, {
                encoding: "utf8",
            });
            const props = {};
            stdout.split("\n").forEach((line) => {
                line = line.trim();
                if (!line)
                    return;
                const match = line.match(/^\[([^\]]+)\]: \[(.*)\]$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    const lower = value.toLowerCase();
                    // Booleanos
                    if (["true", "yes", "1"].includes(lower)) {
                        value = true;
                    }
                    else if (["false", "no", "0"].includes(lower)) {
                        value = false;
                    }
                    // Números enteros o flotantes
                    else if (!isNaN(Number(value)) && value !== "") {
                        value = Number(value);
                    }
                    // String vacío → null
                    else if (value === "") {
                        value = null;
                    }
                    props[key] = value;
                }
            });
            return Object.keys(props).length ? props : null;
        }
        catch {
            return null;
        }
    }
    static power(serial, command, customCommand) {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const adbPath = path.join(__dirname, "dependencies", "adb.exe");
            let cmd = `"${adbPath}" -s ${serial} `;
            const defaultCommands = {
                shutdown: "shell reboot -p",
                reboot: "reboot",
                bootloader: "reboot bootloader",
                fastbootd: "reboot fastboot",
            };
            cmd += customCommand ?? defaultCommands[command] ?? command;
            execSync(cmd, { stdio: "ignore" });
            return { success: true, command: cmd };
        }
        catch (error) {
            return { success: false, command: String(command), error: error.message };
        }
    }
    static listDevices() {
        try {
            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const adbPath = path.join(__dirname, "dependencies", "adb.exe");
            const output = execSync(`"${adbPath}" devices`, { encoding: "utf8" });
            const lines = output
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith("*"));
            const devices = [];
            for (const line of lines.slice(1)) {
                const [serial, stateRaw] = line.split("\t");
                if (!serial || !stateRaw)
                    continue;
                const state = ["device", "offline", "unauthorized"].includes(stateRaw)
                    ? stateRaw
                    : "unknown";
                devices.push({ serial, state });
            }
            return devices;
        }
        catch {
            return [];
        }
    }
    static enableDeveloperMode(serial) {
        try {
            const adb = this.getAdbPath();
            execSync(`"${adb}" -s ${serial} shell settings put global development_settings_enabled 1`);
            execSync(`"${adb}" -s ${serial} shell settings put global adb_enabled 1`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
}
class Async {
    static async enableDeveloperMode(serial) {
        try {
            const adb = Sync.getAdbPath();
            await execAsync(`"${adb}" -s ${serial} shell settings put global development_settings_enabled 1`);
            await execAsync(`"${adb}" -s ${serial} shell settings put global adb_enabled 1`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static async getLocale(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell getprop persist.sys.locale`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout)
                        return resolve(null);
                    const lang = stdout.trim();
                    if (!lang.includes("-"))
                        return resolve(null);
                    const [language, country] = lang.split("-");
                    resolve({ language, country });
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async clearAppData(serial, packageName) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell pm clear ${packageName}`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    const output = (stdout + stderr).trim();
                    const success = /Success/i.test(output);
                    if (error) {
                        resolve({ success: false, command: cmd, error: error.message });
                    }
                    else {
                        resolve({ success, command: cmd, output });
                    }
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: "clearAppData",
                    error: error.message,
                });
            }
        });
    }
    static async getUptime(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell uptime`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout)
                        return resolve(null);
                    resolve(stdout.trim());
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async isRooted(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell which su`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout)
                        return resolve(false);
                    resolve(stdout.trim().length > 0);
                });
            }
            catch {
                resolve(false);
            }
        });
    }
    static async getCpuUsage(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell top -n 1 -b`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout)
                        return resolve(null);
                    const match = stdout.match(/CPU usage:\s+(.*)%/i);
                    resolve(match ? match[1].trim() + "%" : null);
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async getTopApp(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell dumpsys window windows | grep -E 'mCurrentFocus'`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout)
                        return resolve(null);
                    const match = stdout.match(/Window\{.*\s([^\s\/]+)\/([^\s}]+)\}/);
                    resolve(match ? { package: match[1], activity: match[2] } : null);
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async killProcess(serial, pid) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell kill ${pid}`;
                exec(cmd, { encoding: "utf8" }, (error) => {
                    resolve({ success: !error, command: cmd, error: error?.message });
                });
            }
            catch (error) {
                resolve({ success: false, command: "kill", error: error.message });
            }
        });
    }
    static async getProcesses(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell ps -A`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout)
                        return resolve(null);
                    const lines = stdout.trim().split("\n").slice(1);
                    const processes = lines.map((line) => {
                        const parts = line.trim().split(/\s+/);
                        return {
                            user: parts[0],
                            pid: Number(parts[1]),
                            name: parts.slice(-1)[0],
                        };
                    });
                    resolve(processes.length ? processes : null);
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async getNetworkInfo(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell ip addr show wlan0`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout)
                        return resolve(null);
                    const info = {};
                    const ipMatch = stdout.match(/inet\s+(\d+\.\d+\.\d+\.\d+)/);
                    const macMatch = stdout.match(/link\/ether\s+([0-9a-f:]+)/i);
                    if (ipMatch)
                        info["ip_address"] = ipMatch[1];
                    if (macMatch)
                        info["mac_address"] = macMatch[1];
                    info["interface"] = "wlan0";
                    resolve(info);
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async getMemoryInfo(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell cat /proc/meminfo`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    if (error || (!stdout && !stderr))
                        return resolve(null);
                    const output = (stdout + stderr).trim();
                    if (!output)
                        return resolve(null);
                    const memInfo = {};
                    output.split(/\r?\n/).forEach((line) => {
                        const parts = line.split(":");
                        if (parts.length === 2)
                            memInfo[parts[0].trim()] = parts[1].trim().replace(/\s+/g, " ");
                    });
                    resolve(Object.keys(memInfo).length ? memInfo : null);
                });
            }
            catch (err) {
                resolve(null);
            }
        });
    }
    static async getStorageInfo(serial) {
        return new Promise((resolve) => {
            try {
                const adb = ADB.Sync.getAdbPath(); // uso correcto del path
                const cmd = `"${adb}" -s ${serial} shell df -h`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    if (error && !stdout && !stderr)
                        return resolve(null);
                    const output = (stdout + stderr).trim();
                    const lines = output.split("\n");
                    if (lines.length < 2)
                        return resolve(null);
                    const data = lines.slice(1).map((line) => {
                        const parts = line.trim().split(/\s+/);
                        return {
                            device: parts[0] || "",
                            size: parts[1] || "",
                            used: parts[2] || "",
                            available: parts[3] || "",
                            use: parts[4] || "",
                            mount: parts[5] || "",
                        };
                    });
                    resolve(data.length ? data : null);
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static exec(serial, command) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                const cmd = `"${adbPath}" -s ${serial} ${command}`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    resolve({
                        success: !error,
                        command: cmd,
                        output: stdout?.trim(),
                        error: error ? stderr?.trim() || error.message : undefined,
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: command,
                    error: error.message,
                });
            }
        });
    }
    static async setScreenBrightness(serial, level) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell settings put system screen_brightness ${level}`;
                exec(cmd, { encoding: "utf8" }, (error) => {
                    if (error) {
                        resolve({
                            success: false,
                            command: "setScreenBrightness",
                            error: error.message,
                        });
                        return;
                    }
                    resolve({ success: true, command: cmd });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: "setScreenBrightness",
                    error: error.message,
                });
            }
        });
    }
    static async getScreenBrightness(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell settings get system screen_brightness`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout) {
                        resolve(null);
                        return;
                    }
                    resolve(Number(stdout.trim()));
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async getScreenResolution(serial) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell wm size`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout) {
                        resolve(null);
                        return;
                    }
                    const output = stdout.replace("Physical size: ", "").trim();
                    const match = output.match(/^(\d+)x(\d+)$/);
                    if (!match) {
                        resolve(null);
                        return;
                    }
                    resolve({ width: Number(match[1]), height: Number(match[2]) });
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async screenshot(serial, remotePath) {
        return new Promise((resolve) => {
            try {
                const adb = Sync.getAdbPath();
                const cmd = `"${adb}" -s ${serial} shell screencap -p "${remotePath}"`;
                exec(cmd, { encoding: "utf8" }, (error) => {
                    resolve({ success: !error, command: cmd, error: error?.message });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: "screenshot",
                    error: error.message,
                });
            }
        });
    }
    static async uninstallPackage(serial, packageName) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                const cmd = `"${adbPath}" -s ${serial} shell pm uninstall "${packageName}"`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            success: false,
                            command: cmd,
                            error: stderr.trim() || error.message,
                        });
                        return;
                    }
                    const output = (stdout + stderr).trim();
                    const success = /Success/i.test(output);
                    resolve({
                        success,
                        command: cmd,
                        error: success ? undefined : output,
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: "uninstall",
                    error: error.message,
                });
            }
        });
    }
    static async getBatteryInfo(serial) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                const cmd = `"${adbPath}" -s ${serial} shell dumpsys battery`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout) {
                        resolve(null);
                        return;
                    }
                    const info = {};
                    stdout.split("\n").forEach((line) => {
                        const parts = line.trim().split(": ");
                        if (parts.length === 2) {
                            const key = parts[0].trim();
                            let value = parts[1].trim();
                            const lower = value.toLowerCase();
                            if (["true", "yes", "1"].includes(lower))
                                value = true;
                            else if (["false", "no", "0"].includes(lower))
                                value = false;
                            else if (!isNaN(Number(value)))
                                value = Number(value);
                            info[key] = value;
                        }
                    });
                    resolve(Object.keys(info).length ? info : null);
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async getPackages(serial, systemOnly = false) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                const flag = systemOnly ? "-s" : "";
                const cmd = `"${adbPath}" -s ${serial} shell pm list packages ${flag}`;
                exec(cmd, { encoding: "utf8" }, (error, stdout) => {
                    if (error || !stdout) {
                        resolve([]);
                        return;
                    }
                    const packages = stdout
                        .split("\n")
                        .map((l) => l.replace("package:", "").trim())
                        .filter(Boolean);
                    resolve(packages);
                });
            }
            catch {
                resolve([]);
            }
        });
    }
    static async pushFile(serial, localPath, remotePath, ...args) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                const params = args.length ? args.join(" ") : "";
                const cmd = `"${adbPath}" -s ${serial} push ${params} "${localPath}" "${remotePath}"`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            success: false,
                            command: cmd,
                            error: stderr.trim() || error.message,
                        });
                        return;
                    }
                    const output = (stdout + stderr).trim();
                    const success = /[\d\s]+files? pushed/i.test(output) || /100%/i.test(output);
                    resolve({
                        success,
                        command: cmd,
                        error: success ? undefined : output,
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: "push",
                    error: error.message,
                });
            }
        });
    }
    static async pullFile(serial, remotePath, localPath, ...args) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                const params = args.length ? args.join(" ") : "";
                const cmd = `"${adbPath}" -s ${serial} pull ${params} "${remotePath}" "${localPath}"`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            success: false,
                            command: cmd,
                            error: stderr.trim() || error.message,
                        });
                        return;
                    }
                    const output = (stdout + stderr).trim();
                    const success = /[\d\s]+files? pulled/i.test(output) || /100%/i.test(output);
                    resolve({
                        success,
                        command: cmd,
                        error: success ? undefined : output,
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: "pull",
                    error: error.message,
                });
            }
        });
    }
    static async installApk(serial, apkPath, ...args) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                const params = args.length ? args.join(" ") : "";
                const cmd = `"${adbPath}" -s ${serial} install ${params} "${apkPath}"`;
                exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
                    if (error) {
                        resolve({
                            success: false,
                            command: cmd,
                            error: stderr.trim() || error.message,
                        });
                        return;
                    }
                    const output = (stdout + stderr).trim();
                    const success = /Success/i.test(output);
                    resolve({
                        success,
                        command: cmd,
                        error: success ? undefined : output,
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: "install",
                    error: error.message,
                });
            }
        });
    }
    static async getModel(serial) {
        const props = await this.getDeviceProperties(serial);
        return props?.["ro.product.model"] || null;
    }
    static async getBrand(serial) {
        const props = await this.getDeviceProperties(serial);
        return props?.["ro.product.brand"] || null;
    }
    static async getAndroidVersion(serial) {
        const props = await this.getDeviceProperties(serial);
        return props?.["ro.build.version.release"] || null;
    }
    static async getSdkVersion(serial) {
        const props = await this.getDeviceProperties(serial);
        return props?.["ro.build.version.sdk"] || null;
    }
    static async getDeviceProperties(serial) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                exec(`"${adbPath}" -s ${serial} shell getprop`, { encoding: "utf8" }, (error, stdout) => {
                    if (error) {
                        resolve(null);
                        return;
                    }
                    const props = {};
                    stdout.split("\n").forEach((line) => {
                        line = line.trim();
                        if (!line)
                            return;
                        const match = line.match(/^\[([^\]]+)\]: \[(.*)\]$/);
                        if (match) {
                            const key = match[1].trim();
                            let value = match[2].trim();
                            const lower = value.toLowerCase();
                            // Booleanos
                            if (["true", "yes", "1"].includes(lower)) {
                                value = true;
                            }
                            else if (["false", "no", "0"].includes(lower)) {
                                value = false;
                            }
                            // Números enteros o flotantes
                            else if (!isNaN(Number(value)) && value !== "") {
                                value = Number(value);
                            }
                            // String vacío → null
                            else if (value === "") {
                                value = null;
                            }
                            props[key] = value;
                        }
                    });
                    resolve(Object.keys(props).length ? props : null);
                });
            }
            catch {
                resolve(null);
            }
        });
    }
    static async power(serial, command, customCommand) {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                let cmd = `"${adbPath}" -s ${serial} `;
                const defaultCommands = {
                    shutdown: "shell reboot -p",
                    reboot: "reboot",
                    bootloader: "reboot bootloader",
                    fastbootd: "reboot fastboot",
                };
                cmd += customCommand ?? defaultCommands[command] ?? command;
                exec(cmd, { encoding: "utf8" }, (error) => {
                    if (error) {
                        resolve({ success: false, command: cmd, error: error.message });
                        return;
                    }
                    resolve({ success: true, command: cmd });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    command: String(command),
                    error: error.message,
                });
            }
        });
    }
    static async listDevices() {
        return new Promise((resolve) => {
            try {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = path.dirname(__filename);
                const adbPath = path.join(__dirname, "dependencies", "adb.exe");
                exec(`"${adbPath}" devices`, { encoding: "utf8" }, (error, stdout) => {
                    if (error) {
                        resolve([]);
                        return;
                    }
                    const lines = stdout
                        .split("\n")
                        .map((line) => line.trim())
                        .filter((line) => line && !line.startsWith("*"));
                    const devices = [];
                    for (const line of lines.slice(1)) {
                        const [serial, stateRaw] = line.split("\t");
                        if (!serial || !stateRaw)
                            continue;
                        const state = ["device", "offline", "unauthorized"].includes(stateRaw)
                            ? stateRaw
                            : "unknown";
                        devices.push({ serial, state });
                    }
                    resolve(devices);
                });
            }
            catch {
                resolve([]);
            }
        });
    }
}
export default class ADB {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=adb.js.map