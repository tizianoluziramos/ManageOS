import { exec, execSync } from "child_process";
import * as fs from "fs";
class EventLogsParser {
    static parse(output) {
        const entries = [];
        const lines = output.split(/\r?\n/);
        let current = null;
        let lastField = null;
        for (let line of lines) {
            line = line.trim();
            if (!line)
                continue;
            const indexMatch = line.match(/^Index\s*:\s*(\d+)/i);
            if (indexMatch) {
                if (current)
                    entries.push(current);
                current = { index: parseInt(indexMatch[1], 10) };
                lastField = null;
                continue;
            }
            if (!current)
                continue;
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
            }
            else {
                if (lastField && lastField === "message") {
                    current.message += "\n" + line;
                }
            }
        }
        if (current)
            entries.push(current);
        return entries;
    }
}
class Async {
    static list(logName = "System", maxEvents = 50) {
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
        return Async.list("System", maxEvents);
    }
    static listApplicationEvents(maxEvents = 50) {
        return Async.list("Application", maxEvents);
    }
    static listSecurityEvents(maxEvents = 50) {
        return Async.list("Security", maxEvents);
    }
    static watch(logName = "System", callback) {
        const command = `powershell -Command "Get-WinEvent -LogName '${logName}' -MaxEvents 1 -Wait | Format-List"`;
        const child = exec(command);
        child.stdout?.on("data", (chunk) => {
            const entries = EventLogsParser.parse(chunk);
            if (entries.length)
                callback(entries[0]);
        });
    }
}
class Sync {
    static list(logName = "System", maxEvents = 50) {
        try {
            const command = `powershell -Command "Get-EventLog -LogName '${logName}' -Newest ${maxEvents} | Format-List Index,TimeGenerated,EntryType,Source,Message"`;
            const output = execSync(command, { encoding: "utf-8" });
            const data = EventLogsParser.parse(output);
            return { success: true, output, data };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    static listSystemEvents(maxEvents = 50) {
        return Sync.list("System", maxEvents);
    }
    static listApplicationEvents(maxEvents = 50) {
        return Sync.list("Application", maxEvents);
    }
    static listSecurityEvents(maxEvents = 50) {
        return Sync.list("Security", maxEvents);
    }
}
export default class EventLogs {
    static Sync = Sync;
    static Async = Async;
    static exportToJson(data, path) {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }
    static exportToCsv(data, path) {
        const csv = data.map((e) => `"${e.index}","${e.timeGenerated}","${e.entryType}","${e.source}","${e.message?.replace(/\n/g, " ")}"`);
        fs.writeFileSync(path, `"Index","TimeGenerated","EntryType","Source","Message"\n${csv.join("\n")}`);
    }
}
//# sourceMappingURL=eventlogs.js.map