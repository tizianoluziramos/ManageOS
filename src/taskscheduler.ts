import { exec, execSync } from "child_process";

export interface TaskInfo {
  Folder?: string;
  HostName?: string;
  TaskName?: string;
  NextRunTime?: string;
  Status?: string;
  LogonMode?: string;
  LastRunTime?: string;
  LastResult?: string;
  Author?: string;
  TaskToRun?: string;
  StartIn?: string;
  Comment?: string;
  ScheduledTaskState?: string;
  IdleTime?: string;
  PowerManagement?: string;
  RunAsUser?: string;
  DeleteTaskIfNotRescheduled?: string;
  StopTaskIfRunsXHoursXMins?: string;
  Schedule?: string;
  ScheduleType?: string;
  StartTime?: string;
  StartDate?: string;
  EndDate?: string;
  Days?: string;
  Months?: string;
  RepeatEvery?: string;
  RepeatUntilTime?: string;
  RepeatUntilDuration?: string;
  RepeatStopIfStillRunning?: string;
}

class Async {
  static async exists(name: string): Promise<boolean> {
    return new Promise((resolve) => {
      exec(`schtasks /Query /TN "${name}"`, (error) => {
        resolve(!error);
      });
    });
  }

  static async getNextRunTime(name: string): Promise<string | null> {
    return Async.list().then((tasks) => {
      const task = tasks.find((t) => t.TaskName === name);
      return task?.NextRunTime ?? null;
    });
  }

  static update(
    name: string,
    options: { time?: string; command?: string }
  ): Promise<void> {
    const timePart = options.time ? `/ST ${options.time}` : "";
    const commandPart = options.command ? `/TR "${options.command}"` : "";
    return new Promise((resolve, reject) => {
      exec(
        `schtasks /Change /TN "${name}" ${timePart} ${commandPart}`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static async exportTasks(filePath: string): Promise<void> {
    const fs = require("fs");
    return Async.list().then((tasks) => {
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(tasks, null, 2), (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  static importTasks(filePath: string): Promise<void> {
    const fs = require("fs");
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, "utf-8", (err: any, data: any) => {
        if (err) return reject(err);
        const tasks: TaskInfo[] = JSON.parse(data);
        Promise.all(
          tasks.map((task) => {
            if (task.TaskName && task.StartTime && task.TaskToRun) {
              return Async.create(
                task.TaskName,
                task.StartTime,
                task.TaskToRun
              );
            }
          })
        )
          .then(() => resolve())
          .catch(reject);
      });
    });
  }

  static async activeTasks(): Promise<TaskInfo[]> {
    return Async.list().then((tasks) =>
      tasks.filter((task) => task.Status?.toLowerCase() === "ready")
    );
  }

  static create(name: string, time: string, command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        `schtasks /Create /SC DAILY /TN "${name}" /TR "${command}" /ST ${time} /F`,
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  static delete(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`schtasks /Delete /TN "${name}" /F`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static list(): Promise<TaskInfo[]> {
    return new Promise((resolve, reject) => {
      exec(
        "schtasks /Query /V /FO LIST",
        { encoding: "utf-8" },
        (error, stdout) => {
          if (error) return reject(error);

          const tasks: TaskInfo[] = [];
          const blocks = stdout.split(/\n\s*\n/); // separa tareas por doble salto de línea

          for (const block of blocks) {
            const task: TaskInfo = {};
            const lines = block.split("\n");

            for (const line of lines) {
              const [keyRaw, ...valueParts] = line.split(":");
              if (!keyRaw || valueParts.length === 0) continue;

              const key = keyRaw.trim();
              const value = valueParts.join(":").trim();

              switch (key) {
                case "Folder":
                  task.Folder = value;
                  break;
                case "HostName":
                  task.HostName = value;
                  break;
                case "TaskName":
                  task.TaskName = value;
                  break;
                case "Next Run Time":
                  task.NextRunTime = value;
                  break;
                case "Status":
                  task.Status = value;
                  break;
                case "Logon Mode":
                  task.LogonMode = value;
                  break;
                case "Last Run Time":
                  task.LastRunTime = value;
                  break;
                case "Last Result":
                  task.LastResult = value;
                  break;
                case "Author":
                  task.Author = value;
                  break;
                case "Task To Run":
                  task.TaskToRun = value;
                  break;
                case "Start In":
                  task.StartIn = value;
                  break;
                case "Comment":
                  task.Comment = value;
                  break;
                case "Scheduled Task State":
                  task.ScheduledTaskState = value;
                  break;
                case "Idle Time":
                  task.IdleTime = value;
                  break;
                case "Power Management":
                  task.PowerManagement = value;
                  break;
                case "Run As User":
                  task.RunAsUser = value;
                  break;
                case "Delete Task If Not Rescheduled":
                  task.DeleteTaskIfNotRescheduled = value;
                  break;
                case "Stop Task If Runs X Hours and X Mins":
                  task.StopTaskIfRunsXHoursXMins = value;
                  break;
                case "Schedule":
                  task.Schedule = value;
                  break;
                case "Schedule Type":
                  task.ScheduleType = value;
                  break;
                case "Start Time":
                  task.StartTime = value;
                  break;
                case "Start Date":
                  task.StartDate = value;
                  break;
                case "End Date":
                  task.EndDate = value;
                  break;
                case "Days":
                  task.Days = value;
                  break;
                case "Months":
                  task.Months = value;
                  break;
                case "Repeat: Every":
                  task.RepeatEvery = value;
                  break;
                case "Repeat: Until: Time":
                  task.RepeatUntilTime = value;
                  break;
                case "Repeat: Until: Duration":
                  task.RepeatUntilDuration = value;
                  break;
                case "Repeat: Stop If Still Running":
                  task.RepeatStopIfStillRunning = value;
                  break;
              }
            }

            if (Object.keys(task).length > 0) {
              tasks.push(task);
            }
          }

          resolve(tasks);
        }
      );
    });
  }

  static run(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`schtasks /Run /TN "${name}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

class Sync {
  static create(name: string, time: string, command: string): void {
    execSync(
      `schtasks /Create /SC DAILY /TN "${name}" /TR "${command}" /ST ${time} /F`
    );
  }

  static delete(name: string): void {
    execSync(`schtasks /Delete /TN "${name}" /F`);
  }

  static list(): TaskInfo[] {
    const stdout = execSync(`schtasks /Query /FO LIST /V`, {
      encoding: "utf-8",
    });

    const tasks: TaskInfo[] = [];
    const blocks = stdout.split(/\n\s*\n/); // separa tareas por doble salto de línea

    for (const block of blocks) {
      const task: TaskInfo = {};
      const lines = block.split("\n");

      for (const line of lines) {
        const [keyRaw, ...valueParts] = line.split(":");
        if (!keyRaw || valueParts.length === 0) continue;

        const key = keyRaw.trim();
        const value = valueParts.join(":").trim();

        switch (key) {
          case "Folder":
            task.Folder = value;
            break;
          case "HostName":
            task.HostName = value;
            break;
          case "TaskName":
            task.TaskName = value;
            break;
          case "Next Run Time":
            task.NextRunTime = value;
            break;
          case "Status":
            task.Status = value;
            break;
          case "Logon Mode":
            task.LogonMode = value;
            break;
          case "Last Run Time":
            task.LastRunTime = value;
            break;
          case "Last Result":
            task.LastResult = value;
            break;
          case "Author":
            task.Author = value;
            break;
          case "Task To Run":
            task.TaskToRun = value;
            break;
          case "Start In":
            task.StartIn = value;
            break;
          case "Comment":
            task.Comment = value;
            break;
          case "Scheduled Task State":
            task.ScheduledTaskState = value;
            break;
          case "Idle Time":
            task.IdleTime = value;
            break;
          case "Power Management":
            task.PowerManagement = value;
            break;
          case "Run As User":
            task.RunAsUser = value;
            break;
          case "Delete Task If Not Rescheduled":
            task.DeleteTaskIfNotRescheduled = value;
            break;
          case "Stop Task If Runs X Hours and X Mins":
            task.StopTaskIfRunsXHoursXMins = value;
            break;
          case "Schedule":
            task.Schedule = value;
            break;
          case "Schedule Type":
            task.ScheduleType = value;
            break;
          case "Start Time":
            task.StartTime = value;
            break;
          case "Start Date":
            task.StartDate = value;
            break;
          case "End Date":
            task.EndDate = value;
            break;
          case "Days":
            task.Days = value;
            break;
          case "Months":
            task.Months = value;
            break;
          case "Repeat: Every":
            task.RepeatEvery = value;
            break;
          case "Repeat: Until: Time":
            task.RepeatUntilTime = value;
            break;
          case "Repeat: Until: Duration":
            task.RepeatUntilDuration = value;
            break;
          case "Repeat: Stop If Still Running":
            task.RepeatStopIfStillRunning = value;
            break;
        }
      }

      if (Object.keys(task).length > 0) {
        tasks.push(task);
      }
    }

    return tasks;
  }

  static run(name: string): void {
    execSync(`schtasks /Run /TN "${name}"`);
  }
}

export default class TaskScheduler {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
