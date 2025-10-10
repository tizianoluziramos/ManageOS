import HID from "node-hid";
class Async {
    static scan() {
        return new Promise((resolve) => {
            const devices = HID.devices();
            const joysticks = devices.filter((d) => d.usagePage === 1 || d.usagePage === 5);
            resolve(joysticks);
        });
    }
    static listen(deviceInfo, callback) {
        return new Promise((resolve, reject) => {
            try {
                const joystick = new HID.HID(deviceInfo.path);
                joystick.on("data", callback);
                joystick.on("error", (err) => reject(err));
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    static sendInput(deviceInfo, inputData) {
        return new Promise((resolve, reject) => {
            try {
                const joystick = new HID.HID(deviceInfo.path);
                joystick.write(inputData);
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
class Sync {
    static scan() {
        const devices = HID.devices();
        return devices.filter((d) => d.usagePage === 1 || d.usagePage === 5);
    }
    static listen(deviceInfo, callback) {
        try {
            const joystick = new HID.HID(deviceInfo.path);
            joystick.on("data", callback);
            joystick.on("error", () => { });
        }
        catch (err) { }
    }
    static sendInput(deviceInfo, inputData) {
        try {
            const joystick = new HID.HID(deviceInfo.path);
            joystick.write(inputData);
        }
        catch (err) { }
    }
}
export default class Joystick {
    static Sync = Sync;
    static Async = Async;
}
//# sourceMappingURL=joystick.js.map