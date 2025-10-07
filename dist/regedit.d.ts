type RegType = "REG_SZ" | "REG_DWORD" | "REG_BINARY" | "REG_EXPAND_SZ" | "REG_MULTI_SZ";
export default class Regedit {
    static createKey(hiveAndKey: string): Promise<void>;
    static deleteKey(hiveAndKey: string): Promise<void>;
    static setValue(hiveAndKey: string, valueName: string, type: RegType, value: string | number | string[]): Promise<void>;
    static deleteValue(hiveAndKey: string, valueName: string): Promise<void>;
    static listKey(hiveAndKey: string | string[]): Promise<any>;
    static getArch(): string;
}
export {};
//# sourceMappingURL=regedit.d.ts.map