import { exec, execSync } from "child_process";
class Async {
    static validatePolicy(filePath) {
        return new Promise((resolve, reject) => {
            exec(`secedit /validate /cfg "${filePath}"`, (error, stdout, stderr) => {
                if (error)
                    reject(stderr || error);
                else
                    resolve();
            });
        });
    }
    static analyzePolicy(outputReport) {
        return new Promise((resolve, reject) => {
            exec(`secedit /analyze /db secedit.sdb /log "${outputReport}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static resetPolicy() {
        return new Promise((resolve, reject) => {
            exec(`secedit /configure /cfg %windir%\\inf\\defltbase.inf /db secedit.sdb /overwrite`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static applyPolicy(filePath) {
        return new Promise((resolve, reject) => {
            exec(`secedit /configure /db secedit.sdb /cfg "${filePath}" /overwrite`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static exportPolicy(outputPath) {
        return new Promise((resolve, reject) => {
            exec(`secedit /export /cfg "${outputPath}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static verifyPolicy() {
        return new Promise((resolve, reject) => {
            exec(`secedit /analyze /db secedit.sdb`, (error, stdout, stderr) => {
                if (error)
                    reject(stderr || error);
                else
                    resolve();
            });
        });
    }
}
class Sync {
    static validatePolicy(filePath) {
        execSync(`secedit /validate /cfg "${filePath}"`, { stdio: "inherit" });
    }
    static analyzePolicy(outputReport) {
        execSync(`secedit /analyze /db secedit.sdb /log "${outputReport}"`);
    }
    static resetPolicy() {
        execSync(`secedit /configure /cfg %windir%\\inf\\defltbase.inf /db secedit.sdb /overwrite`);
    }
    static applyPolicy(filePath) {
        execSync(`secedit /configure /db secedit.sdb /cfg "${filePath}" /overwrite`);
    }
    static exportPolicy(outputPath) {
        execSync(`secedit /export /cfg "${outputPath}"`);
    }
    static verifyPolicy() {
        execSync(`secedit /analyze /db secedit.sdb`, { stdio: "inherit" });
    }
}
export default class SecPol {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=secpol.js.map