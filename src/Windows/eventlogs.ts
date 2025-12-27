import { exec } from "child_process";
import * as fs from "fs";

type EventLogEntry = {
  index?: number;
  timeGenerated?: string;
  entryType?: string;
  source?: string;
  message?: string;
};

type EventLogResult = {
  success: boolean;
  error?: string;
  output?: string;
  data?: EventLogEntry[];
};

type FilterOptions = {
  since?: Date;
  until?: Date;
  entryType?: string;
  source?: string;
};

class EventLogsParser {
  static parse(output: string): EventLogEntry[] {
    const entries: EventLogEntry[] = [];
    const lines = output.split(/\r?\n/);

    let current: EventLogEntry | null = null;
    let lastField: keyof EventLogEntry | null = null;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const indexMatch = line.match(/^Index\s*:\s*(\d+)/i);
      if (indexMatch) {
        if (current) entries.push(current);
        current = { index: parseInt(indexMatch[1], 10) };
        lastField = null;
        continue;
      }

      if (!current) continue;

      const fieldMatch = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (fieldMatch) {
        const key = fieldMatch[1].toLowerCase();
        const value = fieldMatch[2].trim();

        switch (key) {
          case "timegenerated":
            current.timeGenerated = value;
            lastField = "timeGenerated";
            break;
          case "entrytype":
            current.entryType = value;
            lastField = "entryType";
            break;
          case "source":
            current.source = value;
            lastField = "source";
            break;
          case "message":
            current.message = value;
            lastField = "message";
            break;
          default:
            lastField = null;
            break;
        }
      } else {
        if (lastField && lastField === "message") {
          current.message += "\n" + line;
        }
      }
    }

    if (current) entries.push(current);
    return entries;
  }
}

export default class EventLogs {
  static list(
    logName: string = "System",
    maxEvents: number = 50
  ): Promise<EventLogResult> {
    return new Promise((resolve) => {
      const command = `powershell -Command "Get-EventLog -LogName '${logName}' -Newest ${maxEvents} | Format-List Index,TimeGenerated,EntryType,Source,Message"`;

      exec(command, { encoding: "utf-8" }, (err, stdout, stderr) => {
        if (err) {
          return resolve({ success: false, error: stderr || err.message });
        }
        const data = EventLogsParser.parse(stdout);
        resolve({ success: true, output: stdout, data });
      });
    });
  }

  static listSystemEvents(maxEvents = 50) {
    return EventLogs.list("System", maxEvents);
  }

  static listApplicationEvents(maxEvents = 50) {
    return EventLogs.list("Application", maxEvents);
  }

  static listSecurityEvents(maxEvents = 50) {
    return EventLogs.list("Security", maxEvents);
  }

  static watch(
    logName: string = "System",
    callback: (entry: EventLogEntry) => void
  ) {
    const command = `powershell -Command "Get-WinEvent -LogName '${logName}' -MaxEvents 1 -Wait | Format-List"`;
    const child = exec(command);
    child.stdout?.on("data", (chunk) => {
      const entries = EventLogsParser.parse(chunk);
      if (entries.length) callback(entries[0]);
    });
  }
  static exportToJson(data: EventLogEntry[], path: string) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }

  static exportToCsv(data: EventLogEntry[], path: string) {
    const csv = data.map(
      (e) =>
        `"${e.index}","${e.timeGenerated}","${e.entryType}","${
          e.source
        }","${e.message?.replace(/\n/g, " ")}"`
    );
    fs.writeFileSync(
      path,
      `"Index","TimeGenerated","EntryType","Source","Message"\n${csv.join(
        "\n"
      )}`
    );
  }
}
