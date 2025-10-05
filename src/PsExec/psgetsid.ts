import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARCH = process.arch;
const PSGETSID_PATH = path.join(
  __dirname,
  "dependencies",
  ARCH === "x64" ? "PsGetSid64.exe" : "PsGetSid.exe"
);

export type PsGetSidOptions = {
  computer?: string; // \\computer[,computer,...] o @file
  user?: string; // -u username
  password?: string; // -p password
  account?: string; // account para ver SID
  windowsHide?: boolean;
  timeout?: number;
};

class Async {
  static run(
    options?: PsGetSidOptions
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      try {
        const args = Async.buildArgs(options);

        const child = spawn(PSGETSID_PATH, args, {
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
            reject(new Error("PsGetSid timeout reached"));
          }, options.timeout * 1000);
        }

        child.on("close", (code) => {
          if (code === 0) resolve({ stdout, stderr });
          else reject(new Error(stderr || `PsGetSid exited with code ${code}`));
        });

        child.on("error", reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  private static buildArgs(options?: PsGetSidOptions): string[] {
    const args: string[] = [];

    if (options?.computer) args.push(options.computer);
    if (options?.user) args.push("-u", options.user);
    if (options?.password) args.push("-p", options.password);
    if (options?.account) args.push(options.account);

    return args;
  }
}

class Sync {
  static run(options?: PsGetSidOptions): {
    stdout: string;
    stderr: string;
    status: number | null;
  } {
    const args = Sync.buildArgs(options);

    const child = spawnSync(PSGETSID_PATH, args, {
      shell: true,
      stdio: "pipe",
      windowsHide: options?.windowsHide ?? true,
      timeout: options?.timeout ? options.timeout * 1000 : undefined,
    });

    return {
      stdout: child.stdout?.toString() || "",
      stderr: child.stderr?.toString() || "",
      status: child.status,
    };
  }

  private static buildArgs(options?: PsGetSidOptions): string[] {
    const args: string[] = [];

    if (options?.computer) args.push(options.computer);
    if (options?.user) args.push("-u", options.user);
    if (options?.password) args.push("-p", options.password);
    if (options?.account) args.push(options.account);

    return args;
  }
}

export default class PsGetSid {
  public static readonly Async = Async;
  public static readonly Sync = Sync;
}
