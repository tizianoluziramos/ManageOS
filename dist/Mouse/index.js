import { exec, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mouseExe = path.join(__dirname, "mouse.exe");
function parseJSON(stdout) {
    try {
        return JSON.parse(stdout);
    }
    catch (e) {
        throw new Error("Invalid JSON from mouse.exe");
    }
}
class Async {
    static move(x, y) {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" move ${x} ${y}`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                resolve(result.success || false);
            });
        });
    }
    static click(button = "left") {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" click ${button}`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                resolve(result.success || false);
            });
        });
    }
    static doubleClick() {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" doubleclick`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                resolve(result.success || false);
            });
        });
    }
    static position() {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" position`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                if (result.position && Array.isArray(result.position)) {
                    resolve({ x: result.position[0], y: result.position[1] });
                }
                else {
                    reject(new Error("Invalid position format"));
                }
            });
        });
    }
    static speed(value) {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" speed ${value}`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                resolve(result.success || false);
            });
        });
    }
    static getButtonState() {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" getbuttonstate`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                if (result.buttons && Array.isArray(result.buttons)) {
                    resolve({
                        left: result.buttons[0].left === 1,
                        right: result.buttons[1].right === 1,
                    });
                }
                else {
                    reject(new Error("Invalid button state format"));
                }
            });
        });
    }
    static hide() {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" hide`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                resolve(result.success || false);
            });
        });
    }
    static show() {
        return new Promise((resolve, reject) => {
            exec(`"${mouseExe}" show`, (error, stdout) => {
                if (error)
                    return reject(error);
                const result = parseJSON(stdout);
                resolve(result.success || false);
            });
        });
    }
}
class Sync {
    static move(x, y) {
        const stdout = execSync(`"${mouseExe}" move ${x} ${y}`).toString();
        const result = parseJSON(stdout);
        return result.success || false;
    }
    static click(button = "left") {
        const stdout = execSync(`"${mouseExe}" click ${button}`).toString();
        const result = parseJSON(stdout);
        return result.success || false;
    }
    static doubleClick() {
        const stdout = execSync(`"${mouseExe}" doubleclick`).toString();
        const result = parseJSON(stdout);
        return result.success || false;
    }
    static position() {
        const stdout = execSync(`"${mouseExe}" position`).toString();
        const result = parseJSON(stdout);
        if (result.position && Array.isArray(result.position)) {
            return { x: result.position[0], y: result.position[1] };
        }
        throw new Error("Invalid position format");
    }
    static speed(value) {
        const stdout = execSync(`"${mouseExe}" speed ${value}`).toString();
        const result = parseJSON(stdout);
        return result.success || false;
    }
    static getButtonState() {
        const stdout = execSync(`"${mouseExe}" getbuttonstate`).toString();
        const result = parseJSON(stdout);
        if (result.buttons && Array.isArray(result.buttons)) {
            return {
                left: result.buttons[0].left === 1,
                right: result.buttons[1].right === 1,
            };
        }
        throw new Error("Invalid button state format");
    }
    static hide() {
        const stdout = execSync(`"${mouseExe}" hide`).toString();
        const result = parseJSON(stdout);
        return result.success || false;
    }
    static show() {
        const stdout = execSync(`"${mouseExe}" show`).toString();
        const result = parseJSON(stdout);
        return result.success || false;
    }
}
export default class Mouse {
    static Async = Async;
    static Sync = Sync;
}
//# sourceMappingURL=index.js.map