export default class Encryption {
    private static algorithm;
    private static key;
    private static iv;
    static init(key: string, iv?: Buffer): void;
    static encrypt(text: string): {
        iv: string;
        encryptedData: string;
    };
    static decrypt(encryptedData: string, ivHex: string): string;
    static hash(data: string, algorithm?: string): string;
    static generateKey(length?: number): string;
    static saveKeyToFile(path: string, key: string): void;
    static loadKeyFromFile(path: string): string;
}
//# sourceMappingURL=encryption.d.ts.map