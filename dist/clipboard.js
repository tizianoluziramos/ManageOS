"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clipboardy_1 = __importDefault(require("clipboardy"));
class Sync {
    static read() {
        try {
            return clipboardy_1.default.readSync();
        }
        catch (error) {
            return error;
        }
    }
    static write(text) {
        try {
            clipboardy_1.default.writeSync(text);
            return true;
        }
        catch (error) {
            return error;
        }
    }
    static clear() {
        return this.write("");
    }
}
class Async {
    static async read() {
        try {
            return await clipboardy_1.default.read();
        }
        catch (error) {
            return error;
        }
    }
    static async write(text) {
        try {
            await clipboardy_1.default.write(text);
            return true;
        }
        catch (error) {
            return error;
        }
    }
    static async clear() {
        return await this.write("");
    }
}
class Clipboard {
    static Sync = Sync;
    static Async = Async;
}
exports.default = Clipboard;
//# sourceMappingURL=clipboard.js.map