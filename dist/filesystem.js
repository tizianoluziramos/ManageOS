import { exec, execSync } from "child_process";
import path from "path";
class Sync {
    static createFile(filePath, content = "") {
        try {
            execSync(`echo ${content} > "${filePath}"`);
            return true;
        }
        catch (e) {
            return e;
        }
    }
    static currentPath() {
        return __dirname;
    }
    static listDirectory(dirPath) {
        try {
            const stdout = execSync(`dir "${dirPath}" /B`, { encoding: "utf8" });
            const files = stdout
                .trim()
                .split("\n")
                .map((name) => ({
                name: name.trim(),
                path: path.join(dirPath, name.trim()),
                size: "",
                isDirectory: false,
            }));
            return files;
        }
        catch (error) {
            return [];
        }
    }
    static readFile(filePath) {
        try {
            const content = execSync(`type "${filePath}"`, { encoding: "utf8" });
            return content;
        }
        catch (error) {
            return "";
        }
    }
    static deleteFile(filePath, force = false) {
        try {
            execSync(`del ${force ? "/F" : ""} "${filePath}"`);
            return true;
        }
        catch (e) {
            return e;
        }
    }
    static createDirectory(dirPath) {
        try {
            execSync(`mkdir "${dirPath}"`);
            return true;
        }
        catch (e) {
            return e;
        }
    }
    static deleteDirectory(dirPath, force = false) {
        try {
            execSync(`rmdir ${force ? "/S /Q" : ""} "${dirPath}"`);
            return true;
        }
        catch (e) {
            return e;
        }
    }
}
class Async {
    static currentPath() {
        return __dirname;
    }
    static createFile(filePath, content = "") {
        return new Promise((resolve) => {
            exec(`echo ${content} > "${filePath}"`, (err) => {
                if (err)
                    resolve(err);
                else
                    resolve(true);
            });
        });
    }
    static listDirectory(dirPath) {
        return new Promise((resolve, reject) => {
            exec(`dir "${dirPath}" /B`, (err, stdout) => {
                if (err)
                    return reject(err);
                const files = stdout
                    .trim()
                    .split("\n")
                    .map((name) => ({
                    name: name.trim(),
                    path: path.join(dirPath, name.trim()),
                    size: "",
                    isDirectory: false,
                }));
                resolve(files);
            });
        });
    }
    static readFile(filePath) {
        return new Promise((resolve, reject) => {
            exec(`type "${filePath}"`, (err, stdout) => {
                if (err)
                    return reject(err);
                resolve(stdout);
            });
        });
    }
    static deleteFile(filePath, force = false) {
        return new Promise((resolve) => {
            exec(`del ${force ? "/F" : ""} "${filePath}"`, (err) => {
                if (err)
                    resolve(err);
                else {
                    resolve(true);
                }
            });
        });
    }
    static createDirectory(dirPath) {
        return new Promise((resolve) => {
            exec(`mkdir "${dirPath}"`, (err) => {
                if (err)
                    resolve(err);
                else {
                    resolve(true);
                }
            });
        });
    }
    static deleteDirectory(dirPath, force = false) {
        return new Promise((resolve) => {
            exec(`rmdir ${force ? "/S /Q" : ""} "${dirPath}"`, (err) => {
                if (err)
                    resolve(err);
                else {
                    resolve(true);
                }
            });
        });
    }
}
export default class FileSystem {
    static async = Async;
    static sync = Sync;
}
//# sourceMappingURL=filesystem.js.map