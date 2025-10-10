import HID from "node-hid";

export interface JoystickDevice {
  vendorId: number;
  productId: number;
  path: string;
  product: string;
  usagePage?: number;
  usage?: number;
}

export type JoystickDataCallback = (data: Buffer) => void;

class Async {
  static scan(): Promise<JoystickDevice[]> {
    return new Promise((resolve) => {
      const devices = HID.devices();
      const joysticks = devices.filter(
        (d) => d.usagePage === 1 || d.usagePage === 5
      ) as JoystickDevice[];
      resolve(joysticks);
    });
  }

  static listen(
    deviceInfo: JoystickDevice,
    callback: JoystickDataCallback
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const joystick = new HID.HID(deviceInfo.path);
        joystick.on("data", callback);
        joystick.on("error", (err) => reject(err));
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  static sendInput(
    deviceInfo: JoystickDevice,
    inputData: number[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const joystick = new HID.HID(deviceInfo.path);
        joystick.write(inputData);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}

class Sync {
  static scan(): JoystickDevice[] {
    const devices = HID.devices();
    return devices.filter(
      (d) => d.usagePage === 1 || d.usagePage === 5
    ) as JoystickDevice[];
  }

  static listen(
    deviceInfo: JoystickDevice,
    callback: JoystickDataCallback
  ): void {
    try {
      const joystick = new HID.HID(deviceInfo.path);
      joystick.on("data", callback);
      joystick.on("error", () => {});
    } catch (err) {}
  }

  static sendInput(deviceInfo: JoystickDevice, inputData: number[]): void {
    try {
      const joystick = new HID.HID(deviceInfo.path);
      joystick.write(inputData);
    } catch (err) {}
  }
}

export default class Joystick {
  public static readonly Sync = Sync;
  public static readonly Async = Async;
}
