import NodeWebcam from "node-webcam";
import { exec } from "child_process";
import util from "util";

type WebcamOptions = Record<string, any>;
const execAsync = util.promisify(exec);

interface DriverInfo {
  Status?: string;
  Class?: string;
  FriendlyName?: string;
  InstanceId?: string;
  Description?: string;
}

interface CameraInfo {
  name: string;
  device: string;
  resolution?: string;
  driver?: DriverInfo | DriverInfo[];
}

export default class Camera {
  static async captureMultiple(
    baseFileName: string,
    count: number,
    options?: WebcamOptions
  ): Promise<string[]> {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      const fileName = `${baseFileName}_${i}.jpg`;
      await this.capture(fileName, options);
      results.push(fileName);
    }
    return results;
  }

  static async getCameraResolution(name: string): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `powershell -Command "Get-CimInstance -Namespace root\\CIMV2 -ClassName Win32_PnPEntity | Where-Object { $_.Name -like '*${name}*' } | Select-Object -ExpandProperty Caption"`
      );
      return stdout.trim() || "Unknown";
    } catch (err) {
      return "Unknown";
    }
  }

  static async checkCameraStatus(name: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `powershell -Command "Get-PnpDevice | Where-Object { $_.FriendlyName -like '*${name}*' -and $_.Class -eq 'Camera' } | Select-Object Status | ConvertTo-Json"`
      );
      const parsed = JSON.parse(stdout);
      return parsed.Status === "OK";
    } catch (err) {
      return false;
    }
  }

  static capture(
    fileName: string,
    options?: WebcamOptions
  ): Promise<string | Buffer> {
    return new Promise((resolve, reject) => {
      const Webcam = NodeWebcam.create(options || {});
      Webcam.capture(fileName, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  static async listCameras(): Promise<CameraInfo[]> {
    return new Promise((resolve, reject) => {
      NodeWebcam.list(async (list) => {
        if (!list || list.length === 0) {
          reject(new Error("No se pudieron listar cámaras"));
          return;
        }

        const cameraDetails: CameraInfo[] = [];

        for (const cam of list) {
          let resolution = "Unknown";
          let driver: DriverInfo | DriverInfo[] = [];

          try {
            if (process.platform === "win32") {
              const { stdout } = await execAsync(
                `powershell -Command ` +
                  `"Get-PnpDevice | Where-Object { $_.Class -eq 'Camera' } | ` +
                  `Select-Object Status,Class,FriendlyName,InstanceId,Description | ` +
                  `ConvertTo-Json -Compress"`
              );

              if (stdout && stdout.trim().length > 0) {
                try {
                  const parsed = JSON.parse(stdout);
                  driver = Array.isArray(parsed) ? parsed : [parsed];
                } catch (jsonErr) {}
              }
            }
          } catch (err) {}

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