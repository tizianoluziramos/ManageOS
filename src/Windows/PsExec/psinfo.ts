import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARCH = process.arch;
const PSINFO_PATH = path.join(
  __dirname,
  "dependencies",
  ARCH === "x64" ? "PsInfo64.exe" : "PsInfo.exe"
);

export type PsInfoOptions = {
  computer?: string; // \\computer[,computer,...] o @file
  user?: string; // -u username
  password?: string; // -p password
  showHotfixes?: boolean; // -h
  showSoftware?: boolean; // -s
  showDisk?: boolean; // -d
  csv?: boolean; // -c
  delimiter?: string; // -t
  windowsHide?: boolean;
  timeout?: number;
};

export default class PSInfo {
  static run(
    options?: PsInfoOptions
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      try {
        const args = PSInfo.buildArgs(options);

        const child = spawn(PSINFO_PATH, args, {
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
            reject(new Error("PsInfo timeout reached"));
          }, options.timeout * 1000);
        }

        child.on("close", (code) => {
          if (code === 0) resolve({ stdout, stderr });
          else reject(new Error(stderr || `PsInfo exited with code ${code}`));
        });

        child.on("error", reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  private static buildArgs(options?: PsInfoOptions): string[] {
    const args: string[] = [];

    if (options?.computer) args.push(options.computer);
    if (options?.user) args.push("-u", options.user);
    if (options?.password) args.push("-p", options.password);
    if (options?.showHotfixes) args.push("-h");
    if (options?.showSoftware) args.push("-s");
    if (options?.showDisk) args.push("-d");
    if (options?.csv) args.push("-c");
    if (options?.delimiter) args.push("-t", options.delimiter);

    return args;
  }
}