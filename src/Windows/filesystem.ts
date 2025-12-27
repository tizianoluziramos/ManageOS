import { exec } from "child_process";
import path from "path";

interface FileInfo {
  name: string;
  path: string;
  size: string;
  isDirectory: boolean;
}

export default class FileManager {
  static currentPath(): string {
    return __dirname;
  }
  static createFile(
    filePath: string,
    content = ""
  ): Promise<boolean | unknown> {
    return new Promise((resolve) => {
      exec(`echo ${content} > "${filePath}"`, (err) => {
        if (err) resolve(err);
        else resolve(true);
      });
    });
  }

  static listDirectory(dirPath: string): Promise<FileInfo[]> {
    return new Promise((resolve, reject) => {
      exec(`dir "${dirPath}" /B`, (err, stdout) => {
        if (err) return reject(err);
        const files = stdout
          .trim()
          .split("\n")
          .map((name) => ({
            name: name.trim(),
            path: path.join(dirPath, name.trim()),
            size: "",
            isDirectory: false,
          }));

        resolve(files);
      });
    });
  }

  static readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`type "${filePath}"`, (err, stdout) => {
        if (err) return reject(err);
        resolve(stdout);
      });
    });
  }

  static deleteFile(
    filePath: string,
    force = false
  ): Promise<boolean | unknown> {
    return new Promise((resolve) => {
      exec(`del ${force ? "/F" : ""} "${filePath}"`, (err) => {
        if (err) resolve(err);
        else {
          resolve(true);
        }
      });
    });
  }

  static createDirectory(dirPath: string): Promise<boolean | unknown> {
    return new Promise((resolve) => {
      exec(`mkdir "${dirPath}"`, (err) => {
        if (err) resolve(err);
        else {
          resolve(true);
        }
      });
    });
  }

  static deleteDirectory(
    dirPath: string,
    force = false
  ): Promise<boolean | unknown> {
    return new Promise((resolve) => {
      exec(`rmdir ${force ? "/S /Q" : ""} "${dirPath}"`, (err) => {
        if (err) resolve(err);
        else {
          resolve(true);
        }
      });
    });
  }
}
