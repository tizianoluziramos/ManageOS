import loudness from "loudness";
import deasync from "deasync";
class Sync {
    static getVolume() {
        let result = new Error("Unknown error");
        let done = false;
        loudness
            .getVolume()
            .then((volume) => {
            result = volume;
            done = true;
        })
            .catch((error) => {
            result = error instanceof Error ? error : new Error(String(error));
            done = true;
        });
        deasync.loopWhile(() => !done);
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
        loudness
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
        deasync.loopWhile(() => !done);
        return result;
    }
    static isMuted() {
        let result = new Error("Unknown error");
        let done = false;
        loudness
            .getMuted()
            .then((muted) => {
            result = muted;
            done = true;
        })
            .catch((error) => {
            result = error instanceof Error ? error : new Error(String(error));
            done = true;
        });
        deasync.loopWhile(() => !done);
        return result;
    }
    static mute() {
        let result = { success: false };
        let done = false;
        loudness
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
        deasync.loopWhile(() => !done);
        return result;
    }
    static unmute() {
        let result = { success: false };
        let done = false;
        loudness
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
        deasync.loopWhile(() => !done);
        return result;
    }
}
class Async {
    static async getVolume() {
        try {
            const volume = await loudness.getVolume();
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
        await loudness.setVolume(volume);
        return { success: true };
    }
    static async isMuted() {
        try {
            const muted = await loudness.getMuted();
            return muted;
        }
        catch (error) {
            return error instanceof Error ? error : new Error(String(error));
        }
    }
    static async mute() {
        try {
            await loudness.setMuted(true);
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
            await loudness.setMuted(false);
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
export default class Audio {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=audio.js.map