import { exec, execSync } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
class Async {
    static async isAdmin() {
        try {
            await execAsync("net session");
            return true;
        }
        catch {
            return false;
        }
    }
    static async runAsAdmin(command) {
        try {
            await execAsync(`powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb runAs"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static async elevateSelf() {
        try {
            await execAsync(`powershell -Command "Start-Process '${process.execPath}' -ArgumentList '${process.argv.slice(1).join(" ")}' -Verb runAs"`);
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
}
class Sync {
    static isAdmin() {
        try {
            execSync("net session", { stdio: "ignore" });
            return true;
        }
        catch {
            return false;
        }
    }
    static runAsAdmin(command) {
        try {
            execSync(`powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb runAs"`, { stdio: "inherit" });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static elevateSelf() {
        try {
            execSync(`powershell -Command "Start-Process '${process.execPath}' -ArgumentList '${process.argv.slice(1).join(" ")}' -Verb runAs"`, { stdio: "inherit" });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
}
export default class UAC {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=uac.js.map