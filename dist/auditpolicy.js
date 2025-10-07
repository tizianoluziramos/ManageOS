import { exec, execSync } from "child_process";
class Async {
    static get(policy) {
        return new Promise((resolve, reject) => {
            const cmd = policy
                ? `auditpol /get /subcategory:"${policy}"`
                : "auditpol /get /category:*";
            exec(cmd, (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static set(category, setting) {
        return new Promise((resolve, reject) => {
            const cmd = `auditpol /set /subcategory:"${category}" /success:${setting.includes("Success") ? "enable" : "disable"} /failure:${setting.includes("Failure") ? "enable" : "disable"}`;
            exec(cmd, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static list() {
        return new Promise((resolve, reject) => {
            exec("auditpol /list /subcategory:*", (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static backup(filePath) {
        return new Promise((resolve, reject) => {
            exec(`auditpol /backup /file:"${filePath}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static restore(filePath) {
        return new Promise((resolve, reject) => {
            exec(`auditpol /restore /file:"${filePath}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static clear() {
        return new Promise((resolve, reject) => {
            exec("auditpol /clear", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static remove(user) {
        return new Promise((resolve, reject) => {
            const cmd = user
                ? `auditpol /remove /user:${user}`
                : "auditpol /remove /all";
            exec(cmd, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}
class Sync {
    static get(policy) {
        const cmd = policy
            ? `auditpol /get /subcategory:"${policy}"`
            : "auditpol /get /category:*";
        return execSync(cmd).toString().trim();
    }
    static set(category, setting) {
        const cmd = `auditpol /set /subcategory:"${category}" /success:${setting.includes("Success") ? "enable" : "disable"} /failure:${setting.includes("Failure") ? "enable" : "disable"}`;
        execSync(cmd);
    }
    static list() {
        return execSync("auditpol /list /subcategory:*").toString().trim();
    }
    static backup(filePath) {
        execSync(`auditpol /backup /file:"${filePath}"`);
    }
    static restore(filePath) {
        execSync(`auditpol /restore /file:"${filePath}"`);
    }
    static clear() {
        execSync("auditpol /clear");
    }
    static remove(user) {
        const cmd = user
            ? `auditpol /remove /user:${user}`
            : "auditpol /remove /all";
        execSync(cmd);
    }
}
export default class AuditPolicy {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=auditpolicy.js.map