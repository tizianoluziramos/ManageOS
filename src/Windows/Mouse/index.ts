import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mouseExe = path.join(__dirname, "mouse.exe");

function parseJSON(stdout: string) {
  try {
    return JSON.parse(stdout);
  } catch (e) {
    throw new Error("Invalid JSON from mouse.exe");
  }
}

export default class Mouse {
  static move(x: number, y: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" move ${x} ${y}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static click(button: "left" | "right" = "left"): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" click ${button}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static doubleClick(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" doubleclick`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static position(): Promise<{ x: number; y: number }> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" position`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        if (result.position && Array.isArray(result.position)) {
          resolve({ x: result.position[0], y: result.position[1] });
        } else {
          reject(new Error("Invalid position format"));
        }
      });
    });
  }

  static speed(value: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" speed ${value}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static getButtonState(): Promise<{ left: boolean; right: boolean }> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" getbuttonstate`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        if (result.buttons && Array.isArray(result.buttons)) {
          resolve({
            left: result.buttons[0].left === 1,
            right: result.buttons[1].right === 1,
          });
        } else {
          reject(new Error("Invalid button state format"));
        }
      });
    });
  }

  static hide(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" hide`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }

  static show(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      exec(`"${mouseExe}" show`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.success || false);
      });
    });
  }
}
