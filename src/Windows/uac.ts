import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default class UAC {
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