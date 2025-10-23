import { exec, execSync } from "child_process";
import * as path from "path";

type TaskInfo = {
  name: string;
  nextRunTime: string;
  status: string;
};

type TaskResult = {
  success: boolean;
  error?: string;
};

class Sync {
  static createTask(config: {
    name: string;
    scriptPath: string;
    schedule: "MINUTE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
    time?: string; // "HH:mm"
    args?: string[];
  }): TaskResult {
    try {
      const script = `"${path.resolve(config.scriptPath)}"`;
      const args = config.args ? config.args.join(" ") : "";
      const time = config.time || "09:00";

      const command = `schtasks /Create /TN "${config.name}" /TR "${script} ${args}" /SC ${config.schedule} /ST ${time} /RL HIGHEST /F`;

      execSync(command, { stdio: "ignore" });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || String(error) };
    }
  }

  static list(): TaskInfo[] {
    try {
      const output = execSync(
        `powershell "Get-ScheduledTask | Format-Table TaskName, State, NextRunTime -HideTableHeaders"`,
        { encoding: "utf-8" }
      );

      const lines = output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      return lines.map((line) => {
        const [name, status, nextRunTime] = line.split(/\s{2,}/);
        return { name, status, nextRunTime };
      });
    } catch {
      return [];
    }
  }

  static run(taskName: string): TaskResult {
    try {
      execSync(`schtasks /Run /TN "${taskName}"`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || String(error) };
    }
  }

  static delete(taskName: string): TaskResult {
    try {
      execSync(`schtasks /Delete /TN "${taskName}" /F`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || String(error) };
    }
  }
}

class Async {
  static createTask(config: {
    name: string;
    scriptPath: string;
    schedule: "MINUTE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
    time?: string;
    args?: string[];
  }): Promise<TaskResult> {
    return new Promise((resolve) => {
      try {
        const script = `"${path.resolve(config.scriptPath)}"`;
        const args = config.args ? config.args.join(" ") : "";
        const time = config.time || "09:00";

        const command = `schtasks /Create /TN "${config.name}" /TR "${script} ${args}" /SC ${config.schedule} /ST ${time} /RL HIGHEST /F`;

        exec(command, (err) => {
          if (err) resolve({ success: false, error: err.message });
          else resolve({ success: true });
        });
      } catch (error: any) {
        resolve({ success: false, error: error.message || String(error) });
      }
    });
  }

  static list(): Promise<TaskInfo[]> {
    return new Promise((resolve) => {
      exec(
        `powershell "Get-ScheduledTask | Format-Table TaskName, State, NextRunTime -HideTableHeaders"`,
        { encoding: "utf-8" },
        (err, stdout) => {
          if (err) {
            resolve([]);
            return;
          }

          const lines = stdout
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          const tasks = lines.map((line) => {
            const [name, status, nextRunTime] = line.split(/\s{2,}/);
            return { name, status, nextRunTime };
          });

          resolve(tasks);
        }
      );
    });
  }

  static run(taskName: string): Promise<TaskResult> {
    return new Promise((resolve) => {
      exec(`schtasks /Run /TN "${taskName}"`, (err) => {
        if (err) resolve({ success: false, error: err.message });
        else resolve({ success: true });
      });
    });
  }

  static delete(taskName: string): Promise<TaskResult> {
    return new Promise((resolve) => {
      exec(`schtasks /Delete /TN "${taskName}" /F`, (err) => {
        if (err) resolve({ success: false, error: err.message });
        else resolve({ success: true });
      });
    });
  }
}

export default class Scheduler {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
