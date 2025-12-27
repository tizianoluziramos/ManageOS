import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverExe = path.join(__dirname, "http.exe");

function parseJSON(stdout: string) {
  try {
    return JSON.parse(stdout);
  } catch (e) {}
}

interface ServerOptions {
  port: number;
  folder: string;
  blockedExt?: string[];
}

export default class HTTP {
  static start(options: ServerOptions): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const args = [options.port, options.folder, ...(options.blockedExt || [])]
        .map((a) => `"${a}"`)
        .join(" ");
      exec(`"${serverExe}" ${args}`, (error, stdout) => {
        if (error) return reject(error);
        const result = parseJSON(stdout);
        resolve(result.status || false);
      });
    });
  }
}
