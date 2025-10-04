"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loudness_1 = __importDefault(require("loudness"));
const deasync_1 = __importDefault(require("deasync"));
class Sync {
    static getVolume() {
        let result = new Error("Unknown error");
        let done = false;
        loudness_1.default
            .getVolume()
            .then((volume) => {
            result = volume;
            done = true;
        })
            .catch((error) => {
            result = error instanceof Error ? error : new Error(String(error));
            done = true;
        });
        deasync_1.default.loopWhile(() => !done);
        return result;
    }
    static setVolume(volume) {
        if (volume < 0 || volume > 100) {
            return {
                success: false,
                error: new Error("Volume must be between 0 and 100."),
            };
        }
        if (!Number.isInteger(volume)) {
            return {
                success: false,
                error: new Error("Volume must be an integer."),
            };
        }
        let result = { success: false };
        let done = false;
        loudness_1.default
            .setVolume(volume)
            .then(() => {
            result = { success: true };
            done = true;
        })
            .catch((error) => {
            result = {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
            done = true;
        });
        deasync_1.default.loopWhile(() => !done);
        return result;
    }
    static isMuted() {
        let result = new Error("Unknown error");
        let done = false;
        loudness_1.default
            .getMuted()
            .then((muted) => {
            result = muted;
            done = true;
        })
            .catch((error) => {
            result = error instanceof Error ? error : new Error(String(error));
            done = true;
        });
        deasync_1.default.loopWhile(() => !done);
        return result;
    }
    static mute() {
        let result = { success: false };
        let done = false;
        loudness_1.default
            .setMuted(true)
            .then(() => {
            result = { success: true };
            done = true;
        })
            .catch((error) => {
            result = {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
            done = true;
        });
        deasync_1.default.loopWhile(() => !done);
        return result;
    }
    static unmute() {
        let result = { success: false };
        let done = false;
        loudness_1.default
            .setMuted(false)
            .then(() => {
            result = { success: true };
            done = true;
        })
            .catch((error) => {
            result = {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
            done = true;
        });
        deasync_1.default.loopWhile(() => !done);
        return result;
    }
}
class Async {
    static async getVolume() {
        try {
            const volume = await loudness_1.default.getVolume();
            return volume;
        }
        catch (error) {
            return error instanceof Error ? error : new Error(String(error));
        }
    }
    static async setVolume(volume) {
        // Validate range
        if (volume < 0 || volume > 100) {
            return {
                success: false,
                error: new Error("Volume must be between 0 and 100."),
            };
        }
        // Validate integer
        if (!Number.isInteger(volume)) {
            return {
                success: false,
                error: new Error("Volume must be an integer."),
            };
        }
        await loudness_1.default.setVolume(volume);
        return { success: true };
    }
    static async isMuted() {
        try {
            const muted = await loudness_1.default.getMuted();
            return muted;
        }
        catch (error) {
            return error instanceof Error ? error : new Error(String(error));
        }
    }
    static async mute() {
        try {
            await loudness_1.default.setMuted(true);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    static async unmute() {
        try {
            await loudness_1.default.setMuted(false);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
}
class Audio {
    static Sync = Sync;
    static Async = Async;
}
exports.default = Audio;
//# sourceMappingURL=audio.js.map