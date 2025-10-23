import loudness from "loudness";
import deasync from "deasync";

class Sync {
  static getVolume(): number | Error {
    let result: number | Error = new Error("Unknown error");
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

  static setVolume(volume: number): { success: boolean; error?: Error } {
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

    let result: { success: boolean; error?: Error } = { success: false };
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

  static isMuted(): boolean | Error {
    let result: boolean | Error = new Error("Unknown error");
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

  static mute(): { success: boolean; error?: Error } {
    let result: { success: boolean; error?: Error } = { success: false };
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

  static unmute(): { success: boolean; error?: Error } {
    let result: { success: boolean; error?: Error } = { success: false };
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
  static async getVolume(): Promise<number | Error> {
    try {
      const volume = await loudness.getVolume();
      return volume;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  static async setVolume(
    volume: number
  ): Promise<{ success: boolean; error?: Error }> {
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

  static async isMuted(): Promise<boolean | Error> {
    try {
      const muted = await loudness.getMuted();
      return muted;
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  static async mute(): Promise<{ success: boolean; error?: Error }> {
    try {
      await loudness.setMuted(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  static async unmute(): Promise<{ success: boolean; error?: Error }> {
    try {
      await loudness.setMuted(false);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }
}

export default class Audio {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
