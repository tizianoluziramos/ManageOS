import { exec, execSync } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

class Async {
  static async isAdmin(): Promise<boolean> {
    try {
      await execAsync("net session");
      return true;
    } catch {
      return false;
    }
  }

  static async runAsAdmin(
    command: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await execAsync(
        `powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb runAs"`
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async elevateSelf(): Promise<{ success: boolean; error?: string }> {
    try {
      await execAsync(
        `powershell -Command "Start-Process '${
          process.execPath
        }' -ArgumentList '${process.argv.slice(1).join(" ")}' -Verb runAs"`
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

class Sync {
  static isAdmin(): boolean {
    try {
      execSync("net session", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }

  static runAsAdmin(command: string): { success: boolean; error?: string } {
    try {
      execSync(
        `powershell -Command "Start-Process cmd -ArgumentList '/c ${command}' -Verb runAs"`,
        { stdio: "inherit" }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static elevateSelf(): { success: boolean; error?: string } {
    try {
      execSync(
        `powershell -Command "Start-Process '${
          process.execPath
        }' -ArgumentList '${process.argv.slice(1).join(" ")}' -Verb runAs"`,
        { stdio: "inherit" }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default class UAC {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
