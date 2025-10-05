import { exec, execSync } from "child_process";
class Async {
    static getStatus() {
        return new Promise((resolve, reject) => {
            exec(`powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName,productState | ConvertTo-Json"`, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }
                try {
                    const data = JSON.parse(stdout);
                    const result = Array.isArray(data)
                        ? data.map((item) => ({
                            name: item.displayName,
                            status: Antivirus.Sync.parseProductState(item.productState),
                        }))
                        : [
                            {
                                name: data.displayName,
                                status: Antivirus.Sync.parseProductState(data.productState),
                            },
                        ];
                    resolve(result);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    static listInstalled() {
        return new Promise((resolve, reject) => {
            exec(`powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName | ConvertTo-Json"`, (error, stdout) => {
                if (error) {
                    reject(error);
                    return;
                }
                try {
                    const data = JSON.parse(stdout);
                    const result = Array.isArray(data)
                        ? data.map((item) => item.displayName)
                        : data.displayName
                            ? [data.displayName]
                            : [];
                    resolve(result);
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    static runQuickScan() {
        return new Promise((resolve, reject) => {
            exec(`powershell -Command "Start-MpScan -ScanType QuickScan"`, (error) => {
                if (error)
                    reject(error);
                else
                    resolve();
            });
        });
    }
}
class Sync {
    static getStatus() {
        try {
            const output = execSync(`powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName,productState | ConvertTo-Json"`).toString();
            const data = JSON.parse(output);
            return Array.isArray(data)
                ? data.map((item) => ({
                    name: item.displayName,
                    status: Antivirus.Sync.parseProductState(item.productState),
                }))
                : [
                    {
                        name: data.displayName,
                        status: Antivirus.Sync.parseProductState(data.productState),
                    },
                ];
        }
        catch (error) {
            console.error("Error obteniendo estado antivirus:", error);
            return [];
        }
    }
    static listInstalled() {
        try {
            const output = execSync(`powershell -Command "Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct | Select-Object displayName | ConvertTo-Json"`).toString();
            const data = JSON.parse(output);
            return Array.isArray(data)
                ? data.map((item) => item.displayName)
                : data.displayName
                    ? [data.displayName]
                    : [];
        }
        catch (error) {
            console.error("Error listando antivirus:", error);
            return [];
        }
    }
    static runQuickScan() {
        try {
            execSync(`powershell -Command "Start-MpScan -ScanType QuickScan"`);
        }
        catch (error) {
            console.error("Error ejecutando análisis rápido:", error);
        }
    }
    static parseProductState(state) {
        switch (state) {
            case 266240:
                return "Active protection";
            case 393472:
                return "Disabled protection";
            default:
                return "Unknown state";
        }
    }
}
export default class Antivirus {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=antivirus.js.map