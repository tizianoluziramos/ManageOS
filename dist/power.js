import { exec, execSync } from "child_process";
class Async {
    static lock() {
        return new Promise((resolve, reject) => {
            exec("rundll32.exe user32.dll,LockWorkStation", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static restart() {
        return new Promise((resolve, reject) => {
            exec("shutdown /r /t 0", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static sleep() {
        return new Promise((resolve, reject) => {
            exec("rundll32.exe powrprof.dll,SetSuspendState 0,1,0", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static shutdown() {
        return new Promise((resolve, reject) => {
            exec("shutdown /s /t 0", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}
class Sync {
    static lock() {
        execSync("rundll32.exe user32.dll,LockWorkStation");
    }
    static restart() {
        execSync("shutdown /r /t 0");
    }
    static sleep() {
        execSync("rundll32.exe powprof.dll,SetSuspendState 0,1,0");
    }
    static shutdown() {
        execSync("shutdown /s /t 0");
    }
}
export default class Power {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=power.js.map