import { exec, execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyboardExe = path.join(__dirname, "keyboard.exe");

function parseJSON(stdout: string) {
  try {
    return JSON.parse(stdout.trim());
  } catch (e) {
    throw new Error("Invalid JSON from keyboard.exe: " + stdout);
  }
}

class Async {
  static press(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${keyboardExe}" press ${key}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static release(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${keyboardExe}" release ${key}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static type(text: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${keyboardExe}" type "${text}"`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static repeat(key: string, count: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${keyboardExe}" repeat ${key} ${count}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static isKeyDown(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${keyboardExe}" iskeydown ${key}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.keydown || false);
      });
    });
  }

  static block(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${keyboardExe}" block`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static unblock(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${keyboardExe}" unblock`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }
}

class Sync {
  static press(key: string): boolean {
    const stdout = execSync(`"${keyboardExe}" press ${key}`).toString();
    const result = parseJSON(stdout);
    return result.success || false;
  }

  static release(key: string): boolean {
    const stdout = execSync(`"${keyboardExe}" release ${key}`).toString();
    const result = parseJSON(stdout);
    return result.success || false;
  }

  static type(text: string): boolean {
    const stdout = execSync(`"${keyboardExe}" type "${text}"`).toString();
    const result = parseJSON(stdout);
    return result.success || false;
  }

  static repeat(key: string, count: number): boolean {
    const stdout = execSync(
      `"${keyboardExe}" repeat ${key} ${count}`
    ).toString();
    const result = parseJSON(stdout);
    return result.success || false;
  }

  static isKeyDown(key: string): boolean {
    const stdout = execSync(`"${keyboardExe}" iskeydown ${key}`).toString();
    const result = parseJSON(stdout);
    return result.keydown || false;
  }

  static block(): boolean {
    const stdout = execSync(`"${keyboardExe}" block`).toString();
    const result = parseJSON(stdout);
    return result.success || false;
  }

  static unblock(): boolean {
    const stdout = execSync(`"${keyboardExe}" unblock`).toString();
    const result = parseJSON(stdout);
    return result.success || false;
  }
}

export default class Keyboard {
  public static readonly Async = Async;
  public static readonly Sync = Sync;
}
