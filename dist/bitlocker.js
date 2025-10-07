import { exec, execSync } from "child_process";
class BitLockerParser {
    static parse(output) {
        const volumes = [];
        const blocks = output.split(/\r?\n\r?\n/).filter(Boolean);
        let current = null;
        for (let block of blocks) {
            const lines = block
                .split(/\r?\n/)
                .map((l) => l.trim())
                .filter(Boolean);
            // Detectar inicio de bloque de volumen
            const volMatch = lines[0].match(/^Volume\s+(.+?)(\s+\[(.+?)\])?$/);
            if (volMatch) {
                if (current)
                    volumes.push(current);
                current = {
                    volume: volMatch[1].trim(),
                    label: volMatch[3]?.trim(),
                };
                // Detectar tipo de volumen
                if (lines[1]?.startsWith("[") && lines[1]?.endsWith("]")) {
                    current.type = lines[1].slice(1, -1).trim();
                    lines.shift(); // quitar la línea del tipo
                }
                lines.shift(); // quitar la línea de header
            }
            if (!current)
                continue;
            // Parsear propiedades
            for (const line of lines) {
                const [keyRaw, ...valueParts] = line.split(":");
                if (!valueParts.length)
                    continue;
                const key = keyRaw.trim().toLowerCase().replace(/\s/g, "");
                const value = valueParts.join(":").trim();
                switch (key) {
                    case "size":
                        current.size = value;
                        break;
                    case "bitlockerversion":
                        current.bitLockerVersion = value;
                        break;
                    case "conversionstatus":
                        current.conversionStatus = value;
                        break;
                    case "percentageencrypted":
                        current.percentageEncrypted = value;
                        break;
                    case "encryptionmethod":
                        current.encryptionMethod = value;
                        break;
                    case "protectionstatus":
                        current.protectionStatus = value;
                        break;
                    case "lockstatus":
                        current.lockStatus = value;
                        break;
                    case "identificationfield":
                        current.identificationField = value;
                        break;
                    case "automaticunlock":
                        current.automaticUnlock = value;
                        break;
                    case "keyprotectors":
                        current.keyProtectors = value;
                        break;
                }
            }
        }
        if (current)
            volumes.push(current);
        return volumes;
    }
}
class Async {
    static encrypt(volume, protector, password) {
        return new Promise((resolve) => {
            let cmd = `manage-bde -on ${volume} -${protector}`;
            if (password)
                cmd += ` -pw "${password}"`;
            exec(cmd, (err, stdout, stderr) => {
                if (err)
                    return resolve({ success: false, error: stderr || err.message });
                resolve({ success: true, output: stdout });
            });
        });
    }
    static decrypt(volume) {
        return new Promise((resolve) => {
            exec(`manage-bde -off ${volume}`, (err, stdout, stderr) => {
                if (err)
                    return resolve({ success: false, error: stderr || err.message });
                resolve({ success: true, output: stdout });
            });
        });
    }
    static lock(volume) {
        return new Promise((resolve) => {
            exec(`manage-bde -lock ${volume} -forcedismount`, (err, stdout, stderr) => {
                if (err)
                    return resolve({ success: false, error: stderr || err.message });
                resolve({ success: true, output: stdout });
            });
        });
    }
    static unlock(volume, protector, password) {
        return new Promise((resolve) => {
            let cmd = `manage-bde -unlock ${volume} -${protector}`;
            if (password)
                cmd += ` -pw "${password}"`;
            exec(cmd, (err, stdout, stderr) => {
                if (err)
                    return resolve({ success: false, error: stderr || err.message });
                resolve({ success: true, output: stdout });
            });
        });
    }
    static getKeyProtectors(volume) {
        return new Promise((resolve) => {
            exec(`manage-bde -protectors -get ${volume}`, (err, stdout, stderr) => {
                if (err)
                    return resolve({ success: false, error: stderr || err.message });
                resolve({ success: true, output: stdout });
            });
        });
    }
    static status() {
        return new Promise((resolve) => {
            exec("manage-bde -status", (err, stdout, stderr) => {
                if (err)
                    return resolve({ success: false, error: stderr || err.message });
                const data = BitLockerParser.parse(stdout);
                resolve({ success: true, output: stdout, data });
            });
        });
    }
}
class Sync {
    static status() {
        try {
            const output = execSync("manage-bde -status", { encoding: "utf-8" });
            const data = BitLockerParser.parse(output);
            return { success: true, output, data };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static encrypt(volume, protector, password) {
        try {
            let cmd = `manage-bde -on ${volume} -${protector}`;
            if (password)
                cmd += ` -pw "${password}"`;
            const output = execSync(cmd, { encoding: "utf-8" });
            return { success: true, output };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static decrypt(volume) {
        try {
            const output = execSync(`manage-bde -off ${volume}`, {
                encoding: "utf-8",
            });
            return { success: true, output };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static lock(volume) {
        try {
            const output = execSync(`manage-bde -lock ${volume} -forcedismount`, {
                encoding: "utf-8",
            });
            return { success: true, output };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static unlock(volume, protector, password) {
        try {
            let cmd = `manage-bde -unlock ${volume} -${protector}`;
            if (password)
                cmd += ` -pw "${password}"`;
            const output = execSync(cmd, { encoding: "utf-8" });
            return { success: true, output };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static getKeyProtectors(volume) {
        try {
            const output = execSync(`manage-bde -protectors -get ${volume}`, {
                encoding: "utf-8",
            });
            return { success: true, output };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
}
export default class BitLocker {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=bitlocker.js.map