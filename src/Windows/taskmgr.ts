import { exec } from "child_process";

interface ProcessInfo {
  imageName: string;
  pid: number;
  sessionName: string;
  sessionNumber: number;
  memUsage: string;
}


export default class Taskmgr {
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