import clipboardy from "clipboardy";
class Sync {
    static read() {
        try {
            return clipboardy.readSync();
        }
        catch (error) {
            return error;
        }
    }
    static write(text) {
        try {
            clipboardy.writeSync(text);
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
            return await clipboardy.read();
        }
        catch (error) {
            return error;
        }
    }
    static async write(text) {
        try {
            await clipboardy.write(text);
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
export default class Clipboard {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=clipboard.js.map