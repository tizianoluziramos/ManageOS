import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARCH = process.arch;
const PSINFO_PATH = path.join(__dirname, "dependencies", ARCH === "x64" ? "PsInfo64.exe" : "PsInfo.exe");
class Async {
    static run(options) {
        return new Promise((resolve, reject) => {
            try {
                const args = Async.buildArgs(options);
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
                    if (code === 0)
                        resolve({ stdout, stderr });
                    else
                        reject(new Error(stderr || `PsInfo exited with code ${code}`));
                });
                child.on("error", reject);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static buildArgs(options) {
        const args = [];
        if (options?.computer)
            args.push(options.computer);
        if (options?.user)
            args.push("-u", options.user);
        if (options?.password)
            args.push("-p", options.password);
        if (options?.showHotfixes)
            args.push("-h");
        if (options?.showSoftware)
            args.push("-s");
        if (options?.showDisk)
            args.push("-d");
        if (options?.csv)
            args.push("-c");
        if (options?.delimiter)
            args.push("-t", options.delimiter);
        return args;
    }
}
class Sync {
    static run(options) {
        const args = Sync.buildArgs(options);
        const child = spawnSync(PSINFO_PATH, args, {
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
    static buildArgs(options) {
        const args = [];
        if (options?.computer)
            args.push(options.computer);
        if (options?.user)
            args.push("-u", options.user);
        if (options?.password)
            args.push("-p", options.password);
        if (options?.showHotfixes)
            args.push("-h");
        if (options?.showSoftware)
            args.push("-s");
        if (options?.showDisk)
            args.push("-d");
        if (options?.csv)
            args.push("-c");
        if (options?.delimiter)
            args.push("-t", options.delimiter);
        return args;
    }
}
export default class PsInfo {
    static Async = Async;
    static Sync = Sync;
}
//# sourceMappingURL=psinfo.js.map