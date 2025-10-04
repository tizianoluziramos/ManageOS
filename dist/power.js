"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
class Async {
    static lock() {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)("rundll32.exe user32.dll,LockWorkStation", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static restart() {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)("shutdown /r /t 0", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static sleep() {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)("rundll32.exe powrprof.dll,SetSuspendState 0,1,0", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static shutdown() {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)("shutdown /s /t 0", (error) => {
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
        (0, child_process_1.execSync)("rundll32.exe user32.dll,LockWorkStation");
    }
    static restart() {
        (0, child_process_1.execSync)("shutdown /r /t 0");
    }
    static sleep() {
        (0, child_process_1.execSync)("rundll32.exe powprof.dll,SetSuspendState 0,1,0");
    }
    static shutdown() {
        (0, child_process_1.execSync)("shutdown /s /t 0");
    }
}
class Power {
    Sync = Sync;
    Async = Async;
}
exports.default = Power;
//# sourceMappingURL=power.js.map