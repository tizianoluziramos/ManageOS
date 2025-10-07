import { exec, execSync } from "child_process";
class Async {
    static getSystemLocale() {
        return new Promise((resolve, reject) => {
            exec('powershell -Command "Get-WinSystemLocale | Select-Object -ExpandProperty Name"', (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static getDisplayLanguage() {
        return new Promise((resolve, reject) => {
            exec('powershell -Command "[System.Globalization.CultureInfo]::InstalledUICulture.Name"', (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static setSystemLocale(locale) {
        return new Promise((resolve, reject) => {
            exec(`powershell -Command "Set-WinSystemLocale -SystemLocale ${locale}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static getTimeZone() {
        return new Promise((resolve, reject) => {
            exec('powershell -Command "Get-TimeZone | Select-Object -ExpandProperty Id"', (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static setTimeZone(timeZoneId) {
        return new Promise((resolve, reject) => {
            exec(`powershell -Command "Set-TimeZone -Id '${timeZoneId}'"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static listTimeZones() {
        return new Promise((resolve, reject) => {
            exec('powershell -Command "Get-TimeZone -ListAvailable | Select-Object -ExpandProperty Id"', (error, stdout) => {
                if (error)
                    reject(error);
                else {
                    resolve(stdout
                        .split(/\r?\n/)
                        .map((tz) => tz.trim())
                        .filter(Boolean));
                }
            });
        });
    }
}
class Sync {
    static getSystemLocale() {
        return execSync('powershell -Command "Get-WinSystemLocale | Select-Object -ExpandProperty Name"')
            .toString()
            .trim();
    }
    static getDisplayLanguage() {
        return execSync('powershell -Command "[System.Globalization.CultureInfo]::InstalledUICulture.Name"')
            .toString()
            .trim();
    }
    static setSystemLocale(locale) {
        execSync(`powershell -Command "Set-WinSystemLocale -SystemLocale ${locale}"`);
    }
    static getTimeZone() {
        return execSync('powershell -Command "Get-TimeZone | Select-Object -ExpandProperty Id"')
            .toString()
            .trim();
    }
    static setTimeZone(timeZoneId) {
        execSync(`powershell -Command "Set-TimeZone -Id '${timeZoneId}'"`);
    }
    static listTimeZones() {
        return execSync('powershell -Command "Get-TimeZone -ListAvailable | Select-Object -ExpandProperty Id"')
            .toString()
            .split(/\r?\n/)
            .map((tz) => tz.trim())
            .filter(Boolean);
    }
}
export default class Localization {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=localization.js.map