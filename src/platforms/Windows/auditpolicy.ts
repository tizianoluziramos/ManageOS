import { exec, execSync } from "child_process";

class Async {
  static get(policy?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const cmd = policy
        ? `auditpol /get /subcategory:"${policy}"`
        : "auditpol /get /category:*";
      exec(cmd, (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });
  }

  static set(
    category: string,
    setting: "Success" | "Failure" | "No Auditing" | "Success and Failure"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = `auditpol /set /subcategory:"${category}" /success:${
        setting.includes("Success") ? "enable" : "disable"
      } /failure:${setting.includes("Failure") ? "enable" : "disable"}`;
      exec(cmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static list(): Promise<string> {
    return new Promise((resolve, reject) => {
      exec("auditpol /list /subcategory:*", (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });
  }

  static backup(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`auditpol /backup /file:"${filePath}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static restore(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`auditpol /restore /file:"${filePath}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("auditpol /clear", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static remove(user?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = user
        ? `auditpol /remove /user:${user}`
        : "auditpol /remove /all";
      exec(cmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

class Sync {
  static get(policy?: string): string {
    const cmd = policy
      ? `auditpol /get /subcategory:"${policy}"`
      : "auditpol /get /category:*";
    return execSync(cmd).toString().trim();
  }

  static set(
    category: string,
    setting: "Success" | "Failure" | "No Auditing" | "Success and Failure"
  ): void {
    const cmd = `auditpol /set /subcategory:"${category}" /success:${
      setting.includes("Success") ? "enable" : "disable"
    } /failure:${setting.includes("Failure") ? "enable" : "disable"}`;
    execSync(cmd);
  }

  static list(): string {
    return execSync("auditpol /list /subcategory:*").toString().trim();
  }

  static backup(filePath: string): void {
    execSync(`auditpol /backup /file:"${filePath}"`);
  }

  static restore(filePath: string): void {
    execSync(`auditpol /restore /file:"${filePath}"`);
  }

  static clear(): void {
    execSync("auditpol /clear");
  }

  static remove(user?: string): void {
    const cmd = user
      ? `auditpol /remove /user:${user}`
      : "auditpol /remove /all";
    execSync(cmd);
  }
}

export default class AuditPolicy {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
