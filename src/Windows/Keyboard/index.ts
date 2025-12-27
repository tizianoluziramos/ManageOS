import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyboardExe = path.join(__dirname, "keyboard.exe");

function parseJSON(stdout: string) {
  try {
    return JSON.parse(stdout.trim());
  } catch {
    throw new Error("Invalid JSON from keyboard.exe: " + stdout);
  }
}

function run(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    exec(
      `"${keyboardExe}" ${args.join(" ")}`,
      (error, stdout) => {
        if (error) return reject(error);
        try {
          resolve(parseJSON(stdout));
        } catch (e) {
          reject(e);
        }
      }
    );
  });
}

export default class Keyboard {
  static async press(key: string): Promise<boolean> {
    const result = await run(["press", key]);
    return result.success ?? false;
  }

  static async release(key: string): Promise<boolean> {
    const result = await run(["release", key]);
    return result.success ?? false;
  }

  static async type(text: string): Promise<boolean> {
    const result = await run(["type", `"${text}"`]);
    return result.success ?? false;
  }

  static async repeat(key: string, count: number): Promise<boolean> {
    const result = await run(["repeat", key, String(count)]);
    return result.success ?? false;
  }

  static async isKeyDown(key: string): Promise<boolean> {
    const result = await run(["iskeydown", key]);
    return result.keydown ?? false;
  }

}
