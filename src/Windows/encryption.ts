import crypto from "crypto";
import fs from "fs";

export default class Encryption {
  private static algorithm: string = "aes-256-cbc";
  private static key: Buffer;
  private static iv: Buffer;

  static init(key: string, iv?: Buffer) {
    if (!key || key.length < 32) {
      throw new Error("La clave debe tener al menos 32 caracteres");
    }
    this.key = Buffer.from(key.slice(0, 32));
    this.iv = iv || crypto.randomBytes(16);
  }

  static encrypt(text: string): { iv: string; encryptedData: string } {
    if (!this.key) throw new Error("Encryption key no inicializada");

    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
      iv: this.iv.toString("hex"),
      encryptedData: encrypted,
    };
  }

  static decrypt(encryptedData: string, ivHex: string): string {
    if (!this.key) throw new Error("Encryption key no inicializada");

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  static hash(data: string, algorithm: string = "sha256"): string {
    return crypto.createHash(algorithm).update(data).digest("hex");
  }

  static generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
  }

  static saveKeyToFile(path: string, key: string) {
    fs.writeFileSync(path, key, { encoding: "utf8" });
  }

  static loadKeyFromFile(path: string): string {
    return fs.readFileSync(path, { encoding: "utf8" });
  }
}
