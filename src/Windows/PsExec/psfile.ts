import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PSFILE_PATH = path.join(__dirname, "dependencies", "PsFile.exe");

export type PsFileOptions = {
  computer?: string;
  user?: string;
  password?: string;
  idOrPath?: string; // ID o path del archivo
  close?: boolean; // -c
  windowsHide?: boolean; // ocultar ventana
  timeout?: number; // timeout en segundos
};

export default class PSFile {
  static run(
    cmd?: string,
    options?: PsFileOptions
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      try {
        const args = PSFile.buildArgs(cmd, options);
        const child = spawn(PSFILE_PATH, args, {
          shell: true,
          windowsHide: options?.windowsHide ?? true,
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => (stdout += data.toString()));
        child.stderr.on("data", (data) => (stderr += data.toString()));

        if (options?.timeout) {
          setTimeout(() => {
            child.kill();
            reject(new Error("PsFile timeout reached"));
          }, options.timeout * 1000);
        }

        child.on("close", (code) => {
          if (code === 0) resolve({ stdout, stderr });
          else reject(new Error(stderr || `PsFile exited with code ${code}`));
        });

        child.on("error", reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  private static buildArgs(cmd?: string, options?: PsFileOptions): string[] {
    const args: string[] = [];

    if (options?.computer) args.push(`\\\\${options.computer}`);
    if (options?.user) args.push("-u", options.user);
    if (options?.password) args.push("-p", options.password);
    if (options?.idOrPath) args.push(options.idOrPath);
    if (options?.close) args.push("-c");
    if (cmd) args.push(cmd);

    return args;
  }
}