import { exec } from "child_process";

type BitLockerVolume = {
  volume: string;
  label?: string;
  type?: string;
  size?: string;
  bitLockerVersion?: string;
  conversionStatus?: string;
  percentageEncrypted?: string;
  encryptionMethod?: string;
  protectionStatus?: string;
  lockStatus?: string;
  identificationField?: string;
  automaticUnlock?: string;
  keyProtectors?: string;
};

type Result = {
  success: boolean;
  error?: string;
  output?: string;
  data?: BitLockerVolume[];
};

class BitLockerParser {
  static parse(output: string): BitLockerVolume[] {
    const volumes: BitLockerVolume[] = [];
    const blocks = output.split(/\r?\n\r?\n/).filter(Boolean);

    let current: BitLockerVolume | null = null;

    for (let block of blocks) {
      const lines = block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      // Detectar inicio de bloque de volumen
      const volMatch = lines[0].match(/^Volume\s+(.+?)(\s+\[(.+?)\])?$/);
      if (volMatch) {
        if (current) volumes.push(current);

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

      if (!current) continue;

      // Parsear propiedades
      for (const line of lines) {
        const [keyRaw, ...valueParts] = line.split(":");
        if (!valueParts.length) continue;

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

    if (current) volumes.push(current);
    return volumes;
  }
}

export default class BitLocker {
  static encrypt(
    volume: string,
    protector: string,
    password?: string
  ): Promise<Result> {
    return new Promise((resolve) => {
      let cmd = `manage-bde -on ${volume} -${protector}`;
      if (password) cmd += ` -pw "${password}"`;

      exec(cmd, (err, stdout, stderr) => {
        if (err)
          return resolve({ success: false, error: stderr || err.message });
        resolve({ success: true, output: stdout });
      });
    });
  }

  static decrypt(volume: string): Promise<Result> {
    return new Promise((resolve) => {
      exec(`manage-bde -off ${volume}`, (err, stdout, stderr) => {
        if (err)
          return resolve({ success: false, error: stderr || err.message });
        resolve({ success: true, output: stdout });
      });
    });
  }

  static lock(volume: string): Promise<Result> {
    return new Promise((resolve) => {
      exec(
        `manage-bde -lock ${volume} -forcedismount`,
        (err, stdout, stderr) => {
          if (err)
            return resolve({ success: false, error: stderr || err.message });
          resolve({ success: true, output: stdout });
        }
      );
    });
  }

  static unlock(
    volume: string,
    protector: string,
    password?: string
  ): Promise<Result> {
    return new Promise((resolve) => {
      let cmd = `manage-bde -unlock ${volume} -${protector}`;
      if (password) cmd += ` -pw "${password}"`;

      exec(cmd, (err, stdout, stderr) => {
        if (err)
          return resolve({ success: false, error: stderr || err.message });
        resolve({ success: true, output: stdout });
      });
    });
  }

  static getKeyProtectors(volume: string): Promise<Result> {
    return new Promise((resolve) => {
      exec(`manage-bde -protectors -get ${volume}`, (err, stdout, stderr) => {
        if (err)
          return resolve({ success: false, error: stderr || err.message });
        resolve({ success: true, output: stdout });
      });
    });
  }

  static status(): Promise<Result> {
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