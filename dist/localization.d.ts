declare class Async {
    static getSystemLocale(): Promise<string>;
    static getDisplayLanguage(): Promise<string>;
    static setSystemLocale(locale: string): Promise<void>;
    static getTimeZone(): Promise<string>;
    static setTimeZone(timeZoneId: string): Promise<void>;
    static listTimeZones(): Promise<string[]>;
}
declare class Sync {
    static getSystemLocale(): string;
    static getDisplayLanguage(): string;
    static setSystemLocale(locale: string): void;
    static getTimeZone(): string;
    static setTimeZone(timeZoneId: string): void;
    static listTimeZones(): string[];
}
export default class Localization {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=localization.d.ts.map