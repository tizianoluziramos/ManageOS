import NodeWebcam from "node-webcam";
import { exec, execSync } from "child_process";
import util from "util";
import deasync from "deasync";
const execAsync = util.promisify(exec);
class Sync {
    static captureMultiple(baseFileName, count, options) {
        const results = [];
        for (let i = 0; i < count; i++) {
            const fileName = `${baseFileName}_${i}.jpg`;
            results.push(this.capture(fileName, options));
        }
        return results;
    }
    static getCameraResolution(name) {
        try {
            const stdout = execSync(`powershell -Command "Get-CimInstance -Namespace root\\CIMV2 -ClassName Win32_PnPEntity | Where-Object { $_.Name -like '*${name}*' } | Select-Object -ExpandProperty Caption"`, { encoding: "utf8" });
            return stdout.trim() || "Unknown";
        }
        catch (err) {
            return "Unknown";
        }
    }
    static checkCameraStatus(name) {
        try {
            const stdout = execSync(`powershell -Command "Get-PnpDevice | Where-Object { $_.FriendlyName -like '*${name}*' -and $_.Class -eq 'Camera' } | Select-Object Status | ConvertTo-Json"`, { encoding: "utf8" });
            const parsed = JSON.parse(stdout);
            return parsed.Status === "OK";
        }
        catch (err) {
            return false;
        }
    }
    static capture(fileName, options) {
        let result = "";
        let done = false;
        const Webcam = NodeWebcam.create(options || {});
        Webcam.capture(fileName, (err, data) => {
            if (err) {
                result = "";
            }
            else {
                result = data;
            }
            done = true;
        });
        deasync.loopWhile(() => !done);
        return result;
    }
    static listCameras() {
        let result = [];
        let done = false;
        NodeWebcam.list((list) => {
            if (!list || list.length === 0) {
                done = true;
                return;
            }
            const cameraDetails = [];
            list.forEach((cam) => {
                let resolution = "Unknown";
                let driver = [];
                if (process.platform === "win32") {
                    try {
                        const stdout = execSync(`powershell -Command "Get-PnpDevice | Where-Object { $_.Class -eq 'Camera' } | Select-Object Status,Class,FriendlyName,InstanceId,Description | ConvertTo-Json -Compress"`, { encoding: "utf8" });
                        if (stdout && stdout.trim().length > 0) {
                            try {
                                const parsed = JSON.parse(stdout);
                                driver = Array.isArray(parsed) ? parsed : [parsed];
                            }
                            catch (jsonErr) { }
                        }
                    }
                    catch (err) { }
                }
                cameraDetails.push({
                    name: cam,
                    device: cam,
                    resolution,
                    driver,
                });
            });
            result = cameraDetails;
            done = true;
        });
        deasync.loopWhile(() => !done);
        return result;
    }
}
class Async {
    static async captureMultiple(baseFileName, count, options) {
        const results = [];
        for (let i = 0; i < count; i++) {
            const fileName = `${baseFileName}_${i}.jpg`;
            await this.capture(fileName, options);
            results.push(fileName);
        }
        return results;
    }
    static async getCameraResolution(name) {
        try {
            const { stdout } = await execAsync(`powershell -Command "Get-CimInstance -Namespace root\\CIMV2 -ClassName Win32_PnPEntity | Where-Object { $_.Name -like '*${name}*' } | Select-Object -ExpandProperty Caption"`);
            return stdout.trim() || "Unknown";
        }
        catch (err) {
            return "Unknown";
        }
    }
    static async checkCameraStatus(name) {
        try {
            const { stdout } = await execAsync(`powershell -Command "Get-PnpDevice | Where-Object { $_.FriendlyName -like '*${name}*' -and $_.Class -eq 'Camera' } | Select-Object Status | ConvertTo-Json"`);
            const parsed = JSON.parse(stdout);
            return parsed.Status === "OK";
        }
        catch (err) {
            return false;
        }
    }
    static capture(fileName, options) {
        return new Promise((resolve, reject) => {
            const Webcam = NodeWebcam.create(options || {});
            Webcam.capture(fileName, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }
    static async listCameras() {
        return new Promise((resolve, reject) => {
            NodeWebcam.list(async (list) => {
                if (!list || list.length === 0) {
                    reject(new Error("No se pudieron listar cámaras"));
                    return;
                }
                const cameraDetails = [];
                for (const cam of list) {
                    let resolution = "Unknown";
                    let driver = [];
                    try {
                        if (process.platform === "win32") {
                            const { stdout } = await execAsync(`powershell -Command ` +
                                `"Get-PnpDevice | Where-Object { $_.Class -eq 'Camera' } | ` +
                                `Select-Object Status,Class,FriendlyName,InstanceId,Description | ` +
                                `ConvertTo-Json -Compress"`);
                            if (stdout && stdout.trim().length > 0) {
                                try {
                                    const parsed = JSON.parse(stdout);
                                    driver = Array.isArray(parsed) ? parsed : [parsed];
                                }
                                catch (jsonErr) { }
                            }
                        }
                    }
                    catch (err) { }
                    cameraDetails.push({
                        name: cam,
                        device: cam,
                        resolution,
                        driver,
                    });
                }
                resolve(cameraDetails);
            });
        });
    }
}
export default class Camera {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=camera.js.map