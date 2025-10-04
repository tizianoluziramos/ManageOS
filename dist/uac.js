"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
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
            (0, child_process_1.execSync)("net session", { stdio: "ignore" });
            return true;
        }
        catch {
            return false;
        }
    }
    static runAsAdmin(command) {
        try {
            (0, child_process_1.execSync)(`powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb runAs"`, { stdio: "inherit" });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static elevateSelf() {
        try {
            (0, child_process_1.execSync)(`powershell -Command "Start-Process '${process.execPath}' -ArgumentList '${process.argv.slice(1).join(" ")}' -Verb runAs"`, { stdio: "inherit" });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
}
class UAC {
    static Sync = Sync;
    static Async = Async;
}
exports.default = UAC;
//# sourceMappingURL=uac.js.map