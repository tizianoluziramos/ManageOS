import clipboardy from "clipboardy";

class Sync {
  static read(): string | unknown {
    try {
      return clipboardy.readSync();
    } catch (error) {
      return error;
    }
  }

  static write(text: string): boolean | unknown {
    try {
      clipboardy.writeSync(text);
      return true;
    } catch (error) {
      return error;
    }
  }

  static clear(): boolean | unknown {
    return this.write("");
  }
}

class Async {
  static async read(): Promise<string | unknown> {
    try {
      return await clipboardy.read();
    } catch (error) {
      return error;
    }
  }

  static async write(text: string): Promise<boolean | unknown> {
    try {
      await clipboardy.write(text);
      return true;
    } catch (error) {
      return error;
    }
  }

  static async clear(): Promise<boolean | unknown> {
    return await this.write("");
  }
}

export default class Clipboard {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
