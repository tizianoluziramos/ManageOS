import { exec, execSync } from "child_process";

class Async {
  static open(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec("certmgr.msc", (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static list(store: string = "My"): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`certutil -store ${store}`, (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });
  }

  static export(
    certName: string,
    outputPath: string,
    store: string = "My"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = `certutil -exportPFX ${store} "${certName}" "${outputPath}"`;
      exec(cmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static import(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`certutil -importPFX "${filePath}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static delete(certName: string, store: string = "My"): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`certutil -delstore ${store} "${certName}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static dump(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`certutil -dump "${filePath}"`, (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });
  }

  static verify(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`certutil -verify "${filePath}"`, (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });
  }

  static view(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`certutil -viewstore "${filePath}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static renew(certName: string, store: string = "My"): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`certreq -new "${certName}" "${store}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  static generateSelfSigned(
    subject: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = `powershell -Command "New-SelfSignedCertificate -Subject '${subject}' -CertStoreLocation 'Cert:\\CurrentUser\\My'; Export-Certificate -Cert (Get-ChildItem Cert:\\CurrentUser\\My | where {$_.Subject -like '*${subject}*'}) -FilePath '${outputPath}'"`;
      exec(cmd, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

class Sync {
  static open(): void {
    execSync("certmgr.msc");
  }

  static list(store: string = "My"): string {
    return execSync(`certutil -store ${store}`).toString().trim();
  }

  static export(
    certName: string,
    outputPath: string,
    store: string = "My"
  ): void {
    execSync(`certutil -exportPFX ${store} "${certName}" "${outputPath}"`);
  }

  static import(filePath: string): void {
    execSync(`certutil -importPFX "${filePath}"`);
  }

  static delete(certName: string, store: string = "My"): void {
    execSync(`certutil -delstore ${store} "${certName}"`);
  }

  static dump(filePath: string): string {
    return execSync(`certutil -dump "${filePath}"`).toString().trim();
  }

  static verify(filePath: string): string {
    return execSync(`certutil -verify "${filePath}"`).toString().trim();
  }

  static view(filePath: string): void {
    execSync(`certutil -viewstore "${filePath}"`);
  }

  static renew(certName: string, store: string = "My"): void {
    execSync(`certreq -new "${certName}" "${store}"`);
  }

  static generateSelfSigned(subject: string, outputPath: string): void {
    const cmd = `powershell -Command "New-SelfSignedCertificate -Subject '${subject}' -CertStoreLocation 'Cert:\\CurrentUser\\My'; Export-Certificate -Cert (Get-ChildItem Cert:\\CurrentUser\\My | where {$_.Subject -like '*${subject}*'}) -FilePath '${outputPath}'"`;
    execSync(cmd);
  }
}

export default class Certificates {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
