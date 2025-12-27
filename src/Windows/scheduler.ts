import { exec } from "child_process";
import path from "path";

type TaskInfo = {
  name: string;
  nextRunTime: string;
  status: string;
};

type TaskResult = {
  success: boolean;
  error?: string;
};

export default class Scheduler {
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
