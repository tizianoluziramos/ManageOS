import { exec, execSync } from "child_process";

class Async {
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

class Sync {
  static getSystemLocale(): string {
    return execSync(
      'powershell -Command "Get-WinSystemLocale | Select-Object -ExpandProperty Name"'
    )
      .toString()
      .trim();
  }

  static getDisplayLanguage(): string {
    return execSync(
      'powershell -Command "[System.Globalization.CultureInfo]::InstalledUICulture.Name"'
    )
      .toString()
      .trim();
  }

  static setSystemLocale(locale: string): void {
    execSync(
      `powershell -Command "Set-WinSystemLocale -SystemLocale ${locale}"`
    );
  }

  static getTimeZone(): string {
    return execSync(
      'powershell -Command "Get-TimeZone | Select-Object -ExpandProperty Id"'
    )
      .toString()
      .trim();
  }

  static setTimeZone(timeZoneId: string): void {
    execSync(`powershell -Command "Set-TimeZone -Id '${timeZoneId}'"`);
  }

  static listTimeZones(): string[] {
    return execSync(
      'powershell -Command "Get-TimeZone -ListAvailable | Select-Object -ExpandProperty Id"'
    )
      .toString()
      .split(/\r?\n/)
      .map((tz) => tz.trim())
      .filter(Boolean);
  }
}

export default class Localization {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
