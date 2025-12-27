import loudness from "loudness";

export default class Audio {
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
