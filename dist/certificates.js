import { exec, execSync } from "child_process";
class Async {
    static open() {
        return new Promise((resolve, reject) => {
            exec("certmgr.msc", (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static list(store = "My") {
        return new Promise((resolve, reject) => {
            exec(`certutil -store ${store}`, (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static export(certName, outputPath, store = "My") {
        return new Promise((resolve, reject) => {
            const cmd = `certutil -exportPFX ${store} "${certName}" "${outputPath}"`;
            exec(cmd, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static import(filePath) {
        return new Promise((resolve, reject) => {
            exec(`certutil -importPFX "${filePath}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static delete(certName, store = "My") {
        return new Promise((resolve, reject) => {
            exec(`certutil -delstore ${store} "${certName}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static dump(filePath) {
        return new Promise((resolve, reject) => {
            exec(`certutil -dump "${filePath}"`, (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static verify(filePath) {
        return new Promise((resolve, reject) => {
            exec(`certutil -verify "${filePath}"`, (error, stdout) => {
                if (error)
                    reject(error);
                else
                    resolve(stdout.trim());
            });
        });
    }
    static view(filePath) {
        return new Promise((resolve, reject) => {
            exec(`certutil -viewstore "${filePath}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static renew(certName, store = "My") {
        return new Promise((resolve, reject) => {
            exec(`certreq -new "${certName}" "${store}"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
    static generateSelfSigned(subject, outputPath) {
        return new Promise((resolve, reject) => {
            const cmd = `powershell -Command "New-SelfSignedCertificate -Subject '${subject}' -CertStoreLocation 'Cert:\\CurrentUser\\My'; Export-Certificate -Cert (Get-ChildItem Cert:\\CurrentUser\\My | where {$_.Subject -like '*${subject}*'}) -FilePath '${outputPath}'"`;
            exec(cmd, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}
class Sync {
    static open() {
        execSync("certmgr.msc");
    }
    static list(store = "My") {
        return execSync(`certutil -store ${store}`).toString().trim();
    }
    static export(certName, outputPath, store = "My") {
        execSync(`certutil -exportPFX ${store} "${certName}" "${outputPath}"`);
    }
    static import(filePath) {
        execSync(`certutil -importPFX "${filePath}"`);
    }
    static delete(certName, store = "My") {
        execSync(`certutil -delstore ${store} "${certName}"`);
    }
    static dump(filePath) {
        return execSync(`certutil -dump "${filePath}"`).toString().trim();
    }
    static verify(filePath) {
        return execSync(`certutil -verify "${filePath}"`).toString().trim();
    }
    static view(filePath) {
        execSync(`certutil -viewstore "${filePath}"`);
    }
    static renew(certName, store = "My") {
        execSync(`certreq -new "${certName}" "${store}"`);
    }
    static generateSelfSigned(subject, outputPath) {
        const cmd = `powershell -Command "New-SelfSignedCertificate -Subject '${subject}' -CertStoreLocation 'Cert:\\CurrentUser\\My'; Export-Certificate -Cert (Get-ChildItem Cert:\\CurrentUser\\My | where {$_.Subject -like '*${subject}*'}) -FilePath '${outputPath}'"`;
        execSync(cmd);
    }
}
export default class Certificates {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=certificates.js.map