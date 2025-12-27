import { exec } from "child_process";

type EnsureOptions = {
  onInstallStart?: () => void;
  onInstallSuccess?: () => void;
  onInstallError?: (error: Error) => void;
  installCommand?: string;
};

export type Parser<T> = (raw: string) => T;

// Parser por defecto: intenta parsear a JSON, si falla retorna texto crudo
function defaultParser<T = any>(raw: string): T {
  try {
    return JSON.parse(raw);
  } catch {
    return raw as any;
  }
}

function ensurePSWindowsUpdate(options: EnsureOptions = {}): Promise<void> {
  const {
    onInstallStart,
    onInstallSuccess,
    onInstallError,
    installCommand = 'powershell -Command "Install-Module -Name PSWindowsUpdate -Force -Confirm:$false"',
  } = options;

  return new Promise((resolve, reject) => {
    exec(
      'powershell -Command "Get-Module -ListAvailable PSWindowsUpdate"',
      (error, stdout) => {
        if (error) return reject(error);

        if (!stdout || !stdout.includes("PSWindowsUpdate")) {
          if (onInstallStart) onInstallStart();

          exec(installCommand, (installError) => {
            if (installError) {
              if (onInstallError) onInstallError(installError);
              return reject(installError);
            }

            if (onInstallSuccess) onInstallSuccess();
            resolve();
          });
        } else {
          resolve();
        }
      }
    );
  });
}

export default class WindowsUpdate {
  static async listInstalled<T = any>(
    parser: Parser<T> = defaultParser
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "Get-HotFix | ConvertTo-Json -Compress"',
        (error, stdout, stderr) => {
          if (error) return reject(error);
          resolve(parser(stdout || stderr || ""));
        }
      );
    });
  }

  static async check<T = any>(
    ensureOptions?: EnsureOptions,
    parser: Parser<T> = defaultParser
  ): Promise<T> {
    await ensurePSWindowsUpdate(ensureOptions);

    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "Get-WindowsUpdate | ConvertTo-Json -Compress"',
        (error, stdout, stderr) => {
          if (error) return reject(error);
          resolve(parser(stdout || stderr || ""));
        }
      );
    });
  }

  static async install<T = any>(
    ensureOptions?: EnsureOptions,
    parser: Parser<T> = defaultParser
  ): Promise<T> {
    await ensurePSWindowsUpdate(ensureOptions);

    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "Install-WindowsUpdate -AcceptAll -AutoReboot | ConvertTo-Json -Compress"',
        (error, stdout, stderr) => {
          if (error) return reject(error);
          resolve(parser(stdout || stderr || ""));
        }
      );
    });
  }

  static async uninstall(
    updateId: string,
    ensureOptions?: EnsureOptions
  ): Promise<string> {
    await ensurePSWindowsUpdate(ensureOptions);

    return new Promise((resolve, reject) => {
      exec(
        `powershell -Command "wusa /uninstall /kb:${updateId} /quiet /norestart"`,
        (error, stdout, stderr) => {
          if (error) return reject(error);
          resolve(stdout || stderr);
        }
      );
    });
  }
}