import crypto from "crypto";
import fs from "fs";
export default class Encryption {
    static algorithm = "aes-256-cbc";
    static key;
    static iv;
    static init(key, iv) {
        if (!key || key.length < 32) {
            throw new Error("La clave debe tener al menos 32 caracteres");
        }
        this.key = Buffer.from(key.slice(0, 32));
        this.iv = iv || crypto.randomBytes(16);
    }
    static encrypt(text) {
        if (!this.key)
            throw new Error("Encryption key no inicializada");
        const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return {
            iv: this.iv.toString("hex"),
            encryptedData: encrypted,
        };
    }
    static decrypt(encryptedData, ivHex) {
        if (!this.key)
            throw new Error("Encryption key no inicializada");
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    static hash(data, algorithm = "sha256") {
        return crypto.createHash(algorithm).update(data).digest("hex");
    }
    static generateKey(length = 32) {
        return crypto.randomBytes(length).toString("hex");
    }
    static saveKeyToFile(path, key) {
        fs.writeFileSync(path, key, { encoding: "utf8" });
    }
    static loadKeyFromFile(path) {
        return fs.readFileSync(path, { encoding: "utf8" });
    }
}
//# sourceMappingURL=encryption.js.map