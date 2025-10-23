import { exec, execSync } from "child_process";
import os, { UserInfo } from "os";

class Async {
  static getPid(): Promise<number> {
    return Promise.resolve(process.pid);
  }

  static getExecPath(): Promise<string> {
    return Promise.resolve(process.execPath);
  }

  static getNodeVersion(): Promise<string> {
    return Promise.resolve(process.version);
  }

  static getUserInfo(): Promise<{
    uid: number;
    gid: number;
    username: string;
    homedir: string;
    shell?: string;
  }> {
    return Promise.resolve({
      ...(os.userInfo
        ? os.userInfo()
        : { uid: -1, gid: -1, username: "", homedir: "" }),
    } as any);
  }

  static getSupplementaryGroups(): Promise<number[]> {
    return Promise.resolve(process.getgroups ? process.getgroups() : []);
  }

  static setGroups(groups: Array<number | string>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!process.setgroups) return resolve();
      try {
        // process.setgroups accepts number[] or string[]
        (process.setgroups as any)(groups);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  static setUid(uid: number | string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!process.setuid)
          return reject(new Error("process.setuid not available"));
        (process.setuid as any)(uid);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  static setGid(gid: number | string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!process.setgid)
          return reject(new Error("process.setgid not available"));
        (process.setgid as any)(gid);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  static getUmask(): Promise<number> {
    return Promise.resolve(process.umask());
  }

  static setUmask(mask: number): Promise<number> {
    return Promise.resolve(process.umask(mask));
  }

  // Opcional: mapear uid -> username usando getent (no portable a Windows)
  static getUsernameFromUid(uid: number): Promise<string | null> {
    return new Promise((resolve) => {
      exec(`getent passwd ${uid} | cut -d: -f1`, (err, stdout) => {
        if (err || !stdout) return resolve(null);
        resolve(stdout.trim() || null);
      });
    });
  }

  static getUid(): Promise<number> {
    return Promise.resolve(process.getuid ? process.getuid() : -1);
  }

  static getEUid(): Promise<number> {
    return Promise.resolve(process.geteuid ? process.geteuid() : -1);
  }

  static getGid(): Promise<number> {
    return Promise.resolve(process.getgid ? process.getgid() : -1);
  }

  static getEGid(): Promise<number> {
    return Promise.resolve(process.getegid ? process.getegid() : -1);
  }

  static getParentPid(): Promise<number> {
    return Promise.resolve(process.ppid ?? -1);
  }

  static getResourceLimit(
    resource: string
  ): Promise<{ soft: number | null; hard: number | null }> {
    return new Promise((resolve, reject) => {
      exec(`ulimit -a`, (err, stdout) => {
        if (err) return reject(err);

        const lines = stdout.split("\n");
        for (const line of lines) {
          if (line.includes(resource)) {
            const match = line.match(/\d+/g);
            if (match) {
              resolve({
                soft: parseInt(match[0], 10),
                hard: parseInt(match[0], 10),
              });
              return;
            }
          }
        }
        resolve({ soft: null, hard: null });
      });
    });
  }

  static setResourceLimit(limits: {
    soft?: number | null;
    hard?: number | null;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const value = limits.soft ?? limits.hard;
      if (value == null) return resolve();
      exec(`ulimit -S -n ${value}`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

class Sync {
  static getPid(): number {
    return process.pid;
  }

  static getExecPath(): string {
    return process.execPath;
  }

  static getNodeVersion(): string {
    return process.version;
  }

  static getUserInfo(): UserInfo<string> {
    return os.userInfo
      ? os.userInfo()
      : ({ uid: -1, gid: -1, username: "", homedir: "" } as any);
  }

  static getSupplementaryGroups(): number[] {
    return process.getgroups ? process.getgroups() : [];
  }

  static setGroups(groups: Array<number | string>): void {
    if (!process.setgroups) return;
    try {
      (process.setgroups as any)(groups);
    } catch (err) {
      throw err;
    }
  }

  static setUid(uid: number | string): void {
    if (!process.setuid) throw new Error("process.setuid not available");
    try {
      (process.setuid as any)(uid);
    } catch (err) {
      throw err;
    }
  }

  static setGid(gid: number | string): void {
    if (!process.setgid) throw new Error("process.setgid not available");
    try {
      (process.setgid as any)(gid);
    } catch (err) {
      throw err;
    }
  }

  static getUmask(): number {
    return process.umask();
  }

  static setUmask(mask: number): number {
    return process.umask(mask);
  }

  static getUsernameFromUid(uid: number): string | null {
    try {
      const stdout = execSync(`getent passwd ${uid} | cut -d: -f1`, {
        encoding: "utf-8",
      }).trim();
      return stdout || null;
    } catch {
      return null;
    }
  }

  static getUid(): number {
    return process.getuid ? process.getuid() : -1;
  }

  static getEUid(): number {
    return process.geteuid ? process.geteuid() : -1;
  }

  static getGid(): number {
    return process.getgid ? process.getgid() : -1;
  }

  static getEGid(): number {
    return process.getegid ? process.getegid() : -1;
  }

  static getParentPid(): number {
    return process.ppid ?? -1;
  }

  static getResourceLimit(resource: string): {
    soft: number | null;
    hard: number | null;
  } {
    try {
      const stdout = execSync("ulimit -a", { encoding: "utf-8" });
      const lines = stdout.split("\n");
      for (const line of lines) {
        if (line.includes(resource)) {
          const match = line.match(/\d+/g);
          if (match) {
            return {
              soft: parseInt(match[0], 10),
              hard: parseInt(match[0], 10),
            };
          }
        }
      }
      return { soft: null, hard: null };
    } catch (err) {
      return { soft: null, hard: null };
    }
  }

  static setResourceLimit(limits: {
    soft?: number | null;
    hard?: number | null;
  }): void {
    const value = limits.soft ?? limits.hard;
    if (value == null) return;
    try {
      execSync(`ulimit -S -n ${value}`);
    } catch (err) {
      throw new Error(`Cant reset limit: ${err}`);
    }
  }
}

export default class Users {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
