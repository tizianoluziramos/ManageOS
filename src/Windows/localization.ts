import { exec } from "child_process";

export default class Localization {
  static getSystemLocale(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "Get-WinSystemLocale | Select-Object -ExpandProperty Name"',
        (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout.trim());
        }
      );
    });
  }

  static getDisplayLanguage(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "[System.Globalization.CultureInfo]::InstalledUICulture.Name"',
        (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout.trim());
        }
      );
    });
  }

  static setSystemLocale(locale: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -Command "Set-WinSystemLocale -SystemLocale ${locale}"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static getTimeZone(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "Get-TimeZone | Select-Object -ExpandProperty Id"',
        (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout.trim());
        }
      );
    });
  }

  static setTimeZone(timeZoneId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `powershell -Command "Set-TimeZone -Id '${timeZoneId}'"`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static listTimeZones(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "Get-TimeZone -ListAvailable | Select-Object -ExpandProperty Id"',
        (error, stdout) => {
          if (error) reject(error);
          else {
            resolve(
              stdout
                .split(/\r?\n/)
                .map((tz) => tz.trim())
                .filter(Boolean)
            );
          }
        }
      );
    });
  }
}