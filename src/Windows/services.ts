import { exec } from "child_process";
import path from "path";
import { Service } from "node-windows";

type ServiceInfo = {
  name: string;
  status: string;
};

type ServiceResult = {
  success: boolean;
  error?: string;
};

export default class Services {
  static createService(config: {
    name: string;
    description?: string;
    scriptPath: string;
    args?: string[];
    cwd?: string;
    userName?: string;
    password?: string;
  }): Promise<ServiceResult> {
    return new Promise((resolve) => {
      try {
        const svcConfig: any = {
          name: config.name,
          description: config.description || "Node.js Service",
          script: path.resolve(config.scriptPath),
          cwd: config.cwd || path.dirname(config.scriptPath),
        };

        if (config.userName) {
          svcConfig.user = {
            account: config.userName,
            password: config.password || "",
          };
        }

        if (config.args && config.args.length) {
          svcConfig.env = config.args.map((arg, index) => ({
            name: `ARG${index}`,
            value: arg,
          }));
        }

        const svc = new Service(svcConfig);

        svc.on("install", () => svc.start());
        svc.on("error", (err) =>
          resolve({ success: false, error: err.message })
        );

        svc.install();
        resolve({ success: true });
      } catch (error: any) {
        resolve({ success: false, error: error.message || String(error) });
      }
    });
  }

  static list(): Promise<ServiceInfo[]> {
    return new Promise((resolve) => {
      exec(
        `powershell "Get-Service | Select-Object -Property Name, Status | Format-Table -HideTableHeaders"`,
        { encoding: "utf-8" },
        (err, stdout) => {
          if (err) {
            resolve([]);
            return;
          }

          const lines = stdout
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          const services = lines.map((line) => {
            const [name, ...statusParts] = line.split(/\s{2,}/);
            return { name, status: statusParts.join(" ") };
          });

          resolve(services);
        }
      );
    });
  }

  static start(serviceName: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      exec(`powershell Start-Service -Name "${serviceName}"`, (err) => {
        if (err) resolve({ success: false, error: err.message });
        else resolve({ success: true });
      });
    });
  }

  static stop(serviceName: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      exec(`powershell Stop-Service -Name "${serviceName}"`, (err) => {
        if (err) resolve({ success: false, error: err.message });
        else resolve({ success: true });
      });
    });
  }

  static restart(serviceName: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      exec(`powershell Restart-Service -Name "${serviceName}"`, (err) => {
        if (err) resolve({ success: false, error: err.message });
        else resolve({ success: true });
      });
    });
  }

  static enable(serviceName: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      exec(
        `powershell Set-Service -Name "${serviceName}" -StartupType Automatic`,
        (err) => {
          if (err) resolve({ success: false, error: err.message });
          else resolve({ success: true });
        }
      );
    });
  }

  static disable(serviceName: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      exec(
        `powershell Set-Service -Name "${serviceName}" -StartupType Disabled`,
        (err) => {
          if (err) resolve({ success: false, error: err.message });
          else resolve({ success: true });
        }
      );
    });
  }

  static status(
    serviceName: string
  ): Promise<{ status: string; error?: string }> {
    return new Promise((resolve) => {
      exec(
        `powershell "(Get-Service -Name '${serviceName}').Status"`,
        { encoding: "utf-8" },
        (err, stdout) => {
          if (err) resolve({ status: "unknown", error: err.message });
          else resolve({ status: stdout.trim() });
        }
      );
    });
  }

  static install(
    scriptPath: string,
    serviceName: string,
    description: string = "Node.js Service"
  ): Promise<ServiceResult> {
    return new Promise((resolve) => {
      try {
        const svc = new Service({
          name: serviceName,
          description,
          script: path.resolve(scriptPath),
        });

        svc.on("install", () => svc.start());
        svc.on("error", (err) =>
          resolve({ success: false, error: err.message })
        );

        svc.install();
        resolve({ success: true });
      } catch (error: any) {
        resolve({ success: false, error: error.message || String(error) });
      }
    });
  }

  static uninstall(serviceName: string): Promise<ServiceResult> {
    return new Promise((resolve) => {
      try {
        const svc = new Service({
          name: serviceName,
          script: "C:\\Windows\\System32\\cmd.exe",
        });

        svc.on("uninstall", () => resolve({ success: true }));
        svc.on("error", (err) =>
          resolve({ success: false, error: err.message })
        );

        svc.uninstall();
      } catch (error: any) {
        resolve({ success: false, error: error.message || String(error) });
      }
    });
  }
}
