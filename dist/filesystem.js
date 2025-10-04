"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class Sync {
    static createFile(filePath, content = "") {
        try {
            (0, child_process_1.execSync)(`echo ${content} > "${filePath}"`);
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
            const stdout = (0, child_process_1.execSync)(`dir "${dirPath}" /B`, { encoding: "utf8" });
            const files = stdout
                .trim()
                .split("\n")
                .map((name) => ({
                name: name.trim(),
                path: path_1.default.join(dirPath, name.trim()),
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
            const content = (0, child_process_1.execSync)(`type "${filePath}"`, { encoding: "utf8" });
            return content;
        }
        catch (error) {
            return "";
        }
    }
    static deleteFile(filePath, force = false) {
        try {
            (0, child_process_1.execSync)(`del ${force ? "/F" : ""} "${filePath}"`);
            return true;
        }
        catch (e) {
            return e;
        }
    }
    static createDirectory(dirPath) {
        try {
            (0, child_process_1.execSync)(`mkdir "${dirPath}"`);
            return true;
        }
        catch (e) {
            return e;
        }
    }
    static deleteDirectory(dirPath, force = false) {
        try {
            (0, child_process_1.execSync)(`rmdir ${force ? "/S /Q" : ""} "${dirPath}"`);
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
            (0, child_process_1.exec)(`echo ${content} > "${filePath}"`, (err) => {
                if (err)
                    resolve(err);
                else
                    resolve(true);
            });
        });
    }
    static listDirectory(dirPath) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`dir "${dirPath}" /B`, (err, stdout) => {
                if (err)
                    return reject(err);
                const files = stdout
                    .trim()
                    .split("\n")
                    .map((name) => ({
                    name: name.trim(),
                    path: path_1.default.join(dirPath, name.trim()),
                    size: "",
                    isDirectory: false,
                }));
                resolve(files);
            });
        });
    }
    static readFile(filePath) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`type "${filePath}"`, (err, stdout) => {
                if (err)
                    return reject(err);
                resolve(stdout);
            });
        });
    }
    static deleteFile(filePath, force = false) {
        return new Promise((resolve) => {
            (0, child_process_1.exec)(`del ${force ? "/F" : ""} "${filePath}"`, (err) => {
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
            (0, child_process_1.exec)(`mkdir "${dirPath}"`, (err) => {
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
            (0, child_process_1.exec)(`rmdir ${force ? "/S /Q" : ""} "${dirPath}"`, (err) => {
                if (err)
                    resolve(err);
                else {
                    resolve(true);
                }
            });
        });
    }
}
class FileSystem {
    static async = Async;
    static sync = Sync;
}
exports.default = FileSystem;
//# sourceMappingURL=filesystem.js.map