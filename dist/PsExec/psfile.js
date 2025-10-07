import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PSFILE_PATH = path.join(__dirname, "dependencies", "PsFile.exe");
class Async {
    static run(cmd, options) {
        return new Promise((resolve, reject) => {
            try {
                const args = Async.buildArgs(cmd, options);
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
                    if (code === 0)
                        resolve({ stdout, stderr });
                    else
                        reject(new Error(stderr || `PsFile exited with code ${code}`));
                });
                child.on("error", reject);
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static buildArgs(cmd, options) {
        const args = [];
        if (options?.computer)
            args.push(`\\\\${options.computer}`);
        if (options?.user)
            args.push("-u", options.user);
        if (options?.password)
            args.push("-p", options.password);
        if (options?.idOrPath)
            args.push(options.idOrPath);
        if (options?.close)
            args.push("-c");
        if (cmd)
            args.push(cmd);
        return args;
    }
}
class Sync {
    static run(cmd, options) {
        const args = Sync.buildArgs(cmd, options);
        const child = spawnSync(PSFILE_PATH, args, {
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
    static buildArgs(cmd, options) {
        const args = [];
        if (options?.computer)
            args.push(`\\\\${options.computer}`);
        if (options?.user)
            args.push("-u", options.user);
        if (options?.password)
            args.push("-p", options.password);
        if (options?.idOrPath)
            args.push(options.idOrPath);
        if (options?.close)
            args.push("-c");
        if (cmd)
            args.push(cmd);
        return args;
    }
}
export default class PsFile {
    static Async = Async;
    static Sync = Sync;
}
//# sourceMappingURL=psfile.js.map