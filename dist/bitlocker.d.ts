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
declare class Async {
    static encrypt(volume: string, protector: string, password?: string): Promise<Result>;
    static decrypt(volume: string): Promise<Result>;
    static lock(volume: string): Promise<Result>;
    static unlock(volume: string, protector: string, password?: string): Promise<Result>;
    static getKeyProtectors(volume: string): Promise<Result>;
    static status(): Promise<Result>;
}
declare class Sync {
    static status(): Result;
    static encrypt(volume: string, protector: string, password?: string): Result;
    static decrypt(volume: string): Result;
    static lock(volume: string): Result;
    static unlock(volume: string, protector: string, password?: string): Result;
    static getKeyProtectors(volume: string): Result;
}
export default class BitLocker {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=bitlocker.d.ts.map