"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
class Encryption {
    static algorithm = "aes-256-cbc";
    static key;
    static iv;
    static init(key, iv) {
        if (!key || key.length < 32) {
            throw new Error("La clave debe tener al menos 32 caracteres");
        }
        this.key = Buffer.from(key.slice(0, 32));
        this.iv = iv || crypto_1.default.randomBytes(16);
    }
    static encrypt(text) {
        if (!this.key)
            throw new Error("Encryption key no inicializada");
        const cipher = crypto_1.default.createCipheriv(this.algorithm, this.key, this.iv);
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
        const decipher = crypto_1.default.createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
    static hash(data, algorithm = "sha256") {
        return crypto_1.default.createHash(algorithm).update(data).digest("hex");
    }
    static generateKey(length = 32) {
        return crypto_1.default.randomBytes(length).toString("hex");
    }
    static saveKeyToFile(path, key) {
        fs_1.default.writeFileSync(path, key, { encoding: "utf8" });
    }
    static loadKeyFromFile(path) {
        return fs_1.default.readFileSync(path, { encoding: "utf8" });
    }
}
exports.default = Encryption;
//# sourceMappingURL=encryption.js.map