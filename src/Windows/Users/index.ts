import { exec as originalExec } from "child_process";
import { promisify } from "util";

const exec = promisify(originalExec);

type UserList = string[];

type UserInfo = {
  username: string;
  fullName: string;
  comment: string;
  countryRegionCode: string;
  accountActive: string;
  accountExpires: string;
  passwordLastSet: string;
  passwordExpires: string;
  passwordChangeable: string;
  passwordRequired: string;
  userMayChangePassword: string;
  workstationsAllowed: string;
  logonScript: string;
  profilePath: string;
  homeDirectory: string;
  lastLogon: string;
  logonHoursAllowed: string;
  localGroupMemberships: string[];
  globalGroupMemberships: string[];
};

type CommandResult = {
  success: boolean;
  output?: string;
  error?: string;
};

export default class Users {
  private static cache: {
    users?: { data: string[]; ts: number };
    groups?: { data: string[]; ts: number };
  } = {};

  private static CACHE_TTL_MS = 5_000;

  private static escapeArg(arg: string): string {
    return `"${arg.replace(/"/g, '\\"')}"`;
  }

  private static async execCommand(command: string): Promise<CommandResult> {
    try {
      const { stdout } = await exec(command, {
        encoding: "utf8",
        windowsHide: true,
      });
      return { success: true, output: stdout };
    } catch (err: any) {
      return {
        success: false,
        error: err?.stderr || err?.message || String(err),
      };
    }
  }

  private static parseSectionedOutput(output: string): string[] {
    const lines = output.split(/\r?\n/);
    const result: string[] = [];
    let collecting = false;

    for (const raw of lines) {
      const line = raw.replace(/\r$/, "");
      if (line.includes("-----")) {
        collecting = !collecting;
        continue;
      }
      if (!collecting) continue;
      if (/The command completed/i.test(line)) continue;
      const candidate = line.trim();
      if (candidate) result.push(candidate);
    }

    return result;
  }

  static async doesUserExist(username: string): Promise<boolean> {
    const res = await this.execCommand(`net user ${this.escapeArg(username)}`);
    return res.success;
  }

  static async lockUser(username: string) {
    return this.execCommand(`net user ${this.escapeArg(username)} /lock`);
  }

  static async unlockUser(username: string) {
    return this.execCommand(`net user ${this.escapeArg(username)} /active:yes`);
  }

  static async setUserComment(username: string, comment: string) {
    return this.execCommand(
      `net user ${this.escapeArg(username)} /comment:${this.escapeArg(
        comment
      )}`
    );
  }

  static async getLastLogon(username: string): Promise<CommandResult> {
    const esc = username.replace(/'/g, "''");
    return this.execCommand(
      `powershell -Command "Get-LocalUser -Name '${esc}' | Select -Expand LastLogon"`
    );
  }

  static async createUser(username: string, password?: string) {
    const pass = password ? this.escapeArg(password) : '""';
    const res = await this.execCommand(
      `net user ${this.escapeArg(username)} ${pass} /add`
    );
    if (res.success) delete this.cache.users;
    return res;
  }

  static async deleteUser(username: string) {
    const res = await this.execCommand(
      `net user ${this.escapeArg(username)} /delete`
    );
    if (res.success) delete this.cache.users;
    return res;
  }

  static async changePassword(username: string, newPassword: string) {
    return this.execCommand(
      `net user ${this.escapeArg(username)} ${this.escapeArg(newPassword)}`
    );
  }

  static async setUserActive(username: string, active: boolean) {
    const res = await this.execCommand(
      `net user ${this.escapeArg(username)} /active:${
        active ? "yes" : "no"
      }`
    );
    if (res.success) delete this.cache.users;
    return res;
  }

  static async addUserToGroup(username: string, group: string) {
    const res = await this.execCommand(
      `net localgroup ${this.escapeArg(group)} ${this.escapeArg(username)} /add`
    );
    if (res.success) delete this.cache.groups;
    return res;
  }

  static async removeUserFromGroup(username: string, group: string) {
    const res = await this.execCommand(
      `net localgroup ${this.escapeArg(group)} ${this.escapeArg(
        username
      )} /delete`
    );
    if (res.success) delete this.cache.groups;
    return res;
  }

  static async listUsers(): Promise<UserList> {
    const now = Date.now();
    if (
      this.cache.users &&
      now - this.cache.users.ts < this.CACHE_TTL_MS
    ) {
      return [...this.cache.users.data];
    }

    const res = await this.execCommand("net user");
    if (!res.success || !res.output) return [];

    const parsed = this.parseSectionedOutput(res.output)
      .flatMap((l) => l.split(/\s+/))
      .filter(Boolean);

    this.cache.users = { data: parsed, ts: now };
    return parsed;
  }

  static async listGroups(): Promise<string[]> {
    const now = Date.now();
    if (
      this.cache.groups &&
      now - this.cache.groups.ts < this.CACHE_TTL_MS
    ) {
      return [...this.cache.groups.data];
    }

    const res = await this.execCommand("net localgroup");
    if (!res.success || !res.output) return [];

    const parsed = this.parseSectionedOutput(res.output)
      .map((l) => l.replace(/^\*/, "").trim())
      .filter(Boolean);

    this.cache.groups = { data: parsed, ts: now };
    return parsed;
  }

  static async listGroupMembers(group: string): Promise<string[]> {
    const res = await this.execCommand(
      `net localgroup ${this.escapeArg(group)}`
    );
    if (!res.success || !res.output) return [];

    return this.parseSectionedOutput(res.output)
      .flatMap((l) => l.split(/\s+/))
      .filter(Boolean);
  }

  static async getUserInfo(username: string): Promise<UserInfo | null> {
    const res = await this.execCommand(
      `net user ${this.escapeArg(username)}`
    );
    if (!res.success || !res.output) return null;

    const lines = res.output.split(/\r?\n/);
    const map: Record<string, string> = {};
    let key: string | null = null;

    for (const line of lines) {
      if (/The command completed/i.test(line)) break;
      const m = line.match(/^([^:]+?)\s{2,}(.*)$/);
      if (m) {
        key = m[1].trim();
        map[key] = m[2].trim();
      } else if (key) {
        map[key] += " " + line.trim();
      }
    }

    return {
      username,
      fullName: map["Full Name"] || "",
      comment: map["Comment"] || "",
      countryRegionCode: map["Country/region code"] || "",
      accountActive: map["Account active"] || "",
      accountExpires: map["Account expires"] || "",
      passwordLastSet: map["Password last set"] || "",
      passwordExpires: map["Password expires"] || "",
      passwordChangeable: map["Password changeable"] || "",
      passwordRequired: map["Password required"] || "",
      userMayChangePassword: map["User may change password"] || "",
      workstationsAllowed: map["Workstations allowed"] || "",
      logonScript: map["Logon script"] || "",
      profilePath: map["User profile"] || "",
      homeDirectory: map["Home directory"] || "",
      lastLogon: map["Last logon"] || "",
      logonHoursAllowed: map["Logon hours allowed"] || "",
      localGroupMemberships: (map["Local Group Memberships"] || "")
        .split(/\s+/)
        .filter(Boolean),
      globalGroupMemberships: (map["Global Group memberships"] || "")
        .split(/\s+/)
        .filter(Boolean),
    };
  }

  static async currentUser(): Promise<string> {
    const res = await this.execCommand("whoami");
    return res.output?.trim() || "";
  }
}
