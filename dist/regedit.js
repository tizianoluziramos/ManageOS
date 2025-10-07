import * as regedit from "regedit";
export default class Regedit {
    static createKey(hiveAndKey) {
        return new Promise((resolve, reject) => {
            regedit.createKey([hiveAndKey], (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    static deleteKey(hiveAndKey) {
        return new Promise((resolve, reject) => {
            regedit.deleteKey([hiveAndKey], (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    static setValue(hiveAndKey, valueName, type, value) {
        return new Promise((resolve, reject) => {
            const mapping = {
                [hiveAndKey]: {
                    [valueName]: { value, type },
                },
            };
            regedit.putValue(mapping, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    static deleteValue(hiveAndKey, valueName) {
        return new Promise((resolve, reject) => {
            regedit.deleteValue({ [hiveAndKey]: [valueName] }, (err) => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    static listKey(hiveAndKey) {
        return new Promise((resolve, reject) => {
            regedit.list(hiveAndKey, (err, result) => {
                if (err)
                    return reject(err);
                resolve(result);
            });
        });
    }
    static getArch() {
        return regedit.arch["64"];
    }
}
//# sourceMappingURL=regedit.js.map