import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARCH = process.arch;
const PS_EXEC_PATH = path.join(
  __dirname,
  "dependencies",
  ARCH === "x64" ? "PsExec64.exe" : "PsExec.exe"
);

export type PsExecOptions = {
  computer?: string;
  fileList?: string;
  user?: string;
  password?: string;
  timeout?: number;
  limited?: boolean;
  system?: boolean;
  profile?: boolean;
  interactive?: boolean;
  session?: number;
  copy?: boolean;
  force?: boolean;
  versionCheck?: boolean;
  noWait?: boolean;
  workingDir?: string;
  priority?: "low" | "belownormal" | "abovenormal" | "high" | "realtime";
  processors?: number[];
  winlogon?: boolean;
  windowsHide?: boolean;
};

class Sync {
  static run(
    cmd: string,
    options?: PsExecOptions
  ): { stdout: string; stderr: string; status: number | null } {
    const args = Sync.buildArgs(cmd, options);

    const child = spawnSync(PS_EXEC_PATH, args.split(" "), {
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

  private static buildArgs(cmd: string, options?: PsExecOptions): string {
    let args = "";

    if (options?.computer) args += `\\\\${options.computer} `;
    if (options?.fileList) args += `@${options.fileList} `;
    if (options?.user) args += `-u ${options.user} `;
    if (options?.password) args += `-p ${options.password} `;
    if (options?.timeout) args += `-n ${options.timeout} `;
    if (options?.limited) args += "-l ";
    if (options?.system) args += "-s ";
    if (options?.profile) args += "-e ";
    if (options?.interactive)
      args += `-i${options.session ? " " + options.session : ""} `;
    if (options?.copy) args += "-c ";
    if (options?.force) args += "-f ";
    if (options?.versionCheck) args += "-v ";
    if (options?.noWait) args += "-d ";
    if (options?.workingDir) args += `-w "${options.workingDir}" `;
    if (options?.winlogon) args += "-x ";
    if (options?.priority) args += `-${options.priority} `;
    if (options?.processors) args += `-a ${options.processors.join(",")} `;

    args += cmd;
    return args;
  }
}

class Async {
  static run(cmd: string, options?: PsExecOptions): void {
    const args = Async.buildArgs(cmd, options);

    const child = spawn(PS_EXEC_PATH, args.split(" "), {
      shell: true,
      detached: true,
      stdio: "ignore",
      windowsHide: options?.windowsHide ?? true,
    });

    child.unref();
  }

  private static buildArgs(cmd: string, options?: PsExecOptions): string {
    let args = "";

    if (options?.computer) args += `\\\\${options.computer} `;
    if (options?.fileList) args += `@${options.fileList} `;
    if (options?.user) args += `-u ${options.user} `;
    if (options?.password) args += `-p ${options.password} `;
    if (options?.timeout) args += `-n ${options.timeout} `;
    if (options?.limited) args += "-l ";
    if (options?.system) args += "-s ";
    if (options?.profile) args += "-e ";
    if (options?.interactive)
      args += `-i${options.session ? " " + options.session : ""} `;
    if (options?.copy) args += "-c ";
    if (options?.force) args += "-f ";
    if (options?.versionCheck) args += "-v ";
    if (options?.noWait) args += "-d ";
    if (options?.workingDir) args += `-w "${options.workingDir}" `;
    if (options?.winlogon) args += "-x ";
    if (options?.priority) args += `-${options.priority} `;
    if (options?.processors) args += `-a ${options.processors.join(",")} `;

    args += cmd;
    return args;
  }
}

export default class PsExec {
  public static readonly Async = Async;
  public static readonly Sync = Sync;
}
