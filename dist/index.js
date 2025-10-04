"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const regedit_1 = __importDefault(require("./regedit"));
const taskmgr_1 = __importDefault(require("./taskmgr"));
const filesystem_1 = __importDefault(require("./filesystem"));
const systeminfo_1 = __importDefault(require("./systeminfo"));
const users_1 = __importDefault(require("./users"));
const network_1 = __importDefault(require("./network"));
const clipboard_1 = __importDefault(require("./clipboard"));
const audio_1 = __importDefault(require("./audio"));
const notification_1 = __importDefault(require("./notification"));
const screen_1 = __importDefault(require("./screen"));
const power_1 = __importDefault(require("./power"));
const services_1 = __importDefault(require("./services"));
const firewall_1 = __importDefault(require("./firewall"));
const uac_1 = __importDefault(require("./uac"));
const encryption_1 = __importDefault(require("./encryption"));
class ManageOS {
    static Regedit = regedit_1.default;
    static Taskmgr = taskmgr_1.default;
    static FileSystem = filesystem_1.default;
    static SystemInfo = systeminfo_1.default;
    static Users = users_1.default;
    static Network = network_1.default;
    static Clipboard = clipboard_1.default;
    static Audio = audio_1.default;
    static Notification = notification_1.default;
    static Screen = screen_1.default;
    static Power = power_1.default;
    static Services = services_1.default;
    static Firewall = firewall_1.default;
    static UAC = uac_1.default;
    static Encryption = encryption_1.default;
}
exports.default = ManageOS;
//# sourceMappingURL=index.js.map