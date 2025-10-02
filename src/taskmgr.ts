import { exec, execSync } from "child_process";

interface ProcessInfo {
  imageName: string;
  pid: number;
  sessionName: string;
  sessionNumber: number;
  memUsage: string;
}

class Sync {
  static monitorProcess(
    name: string,
    callback: (status: "start" | "stop") => void
  ): NodeJS.Timeout {
    let running = false;

    const intervalId = setInterval(() => {
      const processes = this.findByName(name);
      const found = processes.length > 0;

      if (found && !running) {
        running = true;
        callback("start");
      } else if (!found && running) {
        running = false;
        callback("stop");
      }
    }, 2000);

    return intervalId;
  }

  static getProcessCount(): number {
    return this.listProcesses().length;
  }

  static findByName(name: string): ProcessInfo[] {
    return this.listProcesses().filter(
      (p) => p.imageName.toLowerCase() === name.toLowerCase()
    );
  }

  static killByName(name: string, force = false): boolean | unknown {
    try {
      execSync(`taskkill /IM ${name} ${force ? "/F" : ""}`);
      return true;
    } catch (e) {
      return e;
    }
  }

  static killByPid(pid: number, force = false): boolean | unknown {
    try {
      execSync(`taskkill /PID ${pid} ${force ? "/F" : ""}`);
      return true;
    } catch (e) {
      return e;
    }
  }
  static listProcesses(): ProcessInfo[] {
    try {
      const stdout = execSync("tasklist", { encoding: "utf8" });
      const lines = stdout.trim().split("\n");

      const separatorIndex = lines.findIndex((line) => line.includes("==="));
      if (separatorIndex === -1) throw new Error("Formato inesperado");

      const separatorLine = lines[separatorIndex];

      const colPositions: number[] = [];
      for (let i = 0; i < separatorLine.length; i++) {
        if (
          separatorLine[i] === "=" &&
          (i === 0 || separatorLine[i - 1] !== "=")
        ) {
          colPositions.push(i);
        }
      }
      colPositions.push(separatorLine.length);

      const dataLines = lines.slice(separatorIndex + 1);

      const processes: ProcessInfo[] = dataLines
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const imageName = line.slice(colPositions[0], colPositions[1]).trim();
          const pid =
            Number(line.slice(colPositions[1], colPositions[2]).trim()) || 0;
          const sessionName = line
            .slice(colPositions[2], colPositions[3])
            .trim();
          const sessionNumber =
            Number(line.slice(colPositions[3], colPositions[4]).trim()) || 0;
          const memUsage = line.slice(colPositions[4]).trim();

          return { imageName, pid, sessionName, sessionNumber, memUsage };
        });

      return processes;
    } catch (error) {
      console.error("Error ejecutando tasklist:", error);
      return [];
    }
  }
}

class Async {
  static async monitorProcess(
    name: string,
    callback: (status: "start" | "stop") => void
  ) {
    let running = false;

    setInterval(async () => {
      const processes = await this.findByName(name);
      const found = processes.length > 0;

      if (found && !running) {
        running = true;
        callback("start");
      } else if (!found && running) {
        running = false;
        callback("stop");
      }
    }, 2000);
  }

  static async getProcessCountAsync(): Promise<number> {
    return (await this.listProcesses()).length;
  }

  static async findByName(name: string): Promise<ProcessInfo[]> {
    const processes = await this.listProcesses();
    return processes.filter(
      (p) => p.imageName.toLowerCase() === name.toLowerCase()
    );
  }

  static killByName(name: string, force = false): Promise<boolean | unknown> {
    return new Promise((resolve) => {
      exec(`taskkill /IM ${name} ${force ? "/F" : ""}`, (err) => {
        if (err) resolve(err);
        else resolve(true);
      });
    });
  }
  static killByPid(pid: number, force = false): Promise<boolean | unknown> {
    return new Promise((resolve) => {
      exec(`taskkill /PID ${pid} ${force ? "/F" : ""}`, (err) => {
        if (err) {
          resolve(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  static listProcesses(): Promise<ProcessInfo[]> {
    return new Promise((resolve, reject) => {
      exec("tasklist", (err, stdout) => {
        if (err) return reject(err);

        const lines = stdout.trim().split("\n");

        const separatorIndex = lines.findIndex((line) => line.includes("==="));
        if (separatorIndex === -1) return reject("Formato inesperado");

        const separatorLine = lines[separatorIndex];

        const colPositions: number[] = [];
        for (let i = 0; i < separatorLine.length; i++) {
          if (
            separatorLine[i] === "=" &&
            (i === 0 || separatorLine[i - 1] !== "=")
          ) {
            colPositions.push(i);
          }
        }
        colPositions.push(separatorLine.length);

        const dataLines = lines.slice(separatorIndex + 1);

        const processes: ProcessInfo[] = dataLines
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const imageName = line
              .slice(colPositions[0], colPositions[1])
              .trim();
            const pid =
              Number(line.slice(colPositions[1], colPositions[2]).trim()) || 0;
            const sessionName = line
              .slice(colPositions[2], colPositions[3])
              .trim();
            const sessionNumber =
              Number(line.slice(colPositions[3], colPositions[4]).trim()) || 0;
            const memUsage = line.slice(colPositions[4]).trim();

            return { imageName, pid, sessionName, sessionNumber, memUsage };
          });

        resolve(processes);
      });
    });
  }
}

export default class Taskmgr {
  static readonly async = Async;
  static readonly sync = Sync;
}
