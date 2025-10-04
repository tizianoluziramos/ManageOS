import { exec, execSync } from "child_process";

type Rule = {
  name: string;
  direction?: "Inbound" | "Outbound";
  action?: "Allow" | "Block";
  protocol?: "TCP" | "UDP" | "Any";
  localPort?: number | string;
  remoteAddress?: string;
};

type FirewallResult = {
  success: boolean;
  error?: string;
};

type ListRulesResult = {
  success: boolean;
  rules?: string[];
  error?: string;
};

class Async {
  private static runCommand(cmd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`powershell -Command "${cmd}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static async addRule(rule: Rule): Promise<FirewallResult> {
    try {
      const parts: string[] = [
        `-DisplayName "${rule.name}"`,
        `-Direction ${rule.direction || "Inbound"}`,
        `-Action ${rule.action || "Allow"}`,
      ];

      if (rule.protocol) parts.push(`-Protocol ${rule.protocol}`);
      if (rule.localPort) parts.push(`-LocalPort ${rule.localPort}`);
      if (rule.remoteAddress)
        parts.push(`-RemoteAddress ${rule.remoteAddress}`);

      const cmd = `New-NetFirewallRule ${parts.join(" ")}`;
      await this.runCommand(cmd);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async removeRule(name: string): Promise<FirewallResult> {
    try {
      const cmd = `Remove-NetFirewallRule -DisplayName "${name}"`;
      await this.runCommand(cmd);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async listRules(): Promise<ListRulesResult> {
    return new Promise((resolve) => {
      exec(
        `powershell -Command "Get-NetFirewallRule | Select-Object -ExpandProperty DisplayName"`,
        { encoding: "utf-8" },
        (error, stdout) => {
          if (error) {
            resolve({ success: false, error: error.message });
            return;
          }
          const rules = stdout
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);
          resolve({ success: true, rules });
        }
      );
    });
  }
}

class Sync {
  private static runCommand(cmd: string): void {
    execSync(`powershell -Command "${cmd}"`, { stdio: "ignore" });
  }

  static addRule(rule: Rule): FirewallResult {
    try {
      const parts: string[] = [
        `-DisplayName "${rule.name}"`,
        `-Direction ${rule.direction || "Inbound"}`,
        `-Action ${rule.action || "Allow"}`,
      ];

      if (rule.protocol) parts.push(`-Protocol ${rule.protocol}`);
      if (rule.localPort) parts.push(`-LocalPort ${rule.localPort}`);
      if (rule.remoteAddress)
        parts.push(`-RemoteAddress ${rule.remoteAddress}`);

      const cmd = `New-NetFirewallRule ${parts.join(" ")}`;
      this.runCommand(cmd);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static removeRule(name: string): FirewallResult {
    try {
      const cmd = `Remove-NetFirewallRule -DisplayName "${name}"`;
      this.runCommand(cmd);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static listRules(): { success: boolean; rules?: string[]; error?: string } {
    try {
      const output = execSync(
        `powershell -Command "Get-NetFirewallRule | Select-Object -ExpandProperty DisplayName"`,
        { encoding: "utf-8" }
      );
      const rules = output
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line);
      return { success: true, rules };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default class Firewall {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
