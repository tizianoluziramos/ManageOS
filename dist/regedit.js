"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const regedit = __importStar(require("regedit"));
class Regedit {
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
exports.default = Regedit;
//# sourceMappingURL=regedit.js.map