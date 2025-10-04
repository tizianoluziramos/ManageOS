"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SystemInfo;
const os_1 = __importDefault(require("os"));
function SystemInfo() {
    return {
        platform: os_1.default.platform(),
        architecture: os_1.default.arch(),
        release: os_1.default.release(),
        hostname: os_1.default.hostname(),
        uptime: os_1.default.uptime(),
        cpus: os_1.default.cpus(),
        totalMemory: os_1.default.totalmem(),
        freeMemory: os_1.default.freemem(),
        loadAverage: os_1.default.loadavg(),
        tmpDir: os_1.default.tmpdir(),
        homeDir: os_1.default.homedir(),
        type: os_1.default.type(),
        userInfo: os_1.default.userInfo(),
    };
}
//# sourceMappingURL=systeminfo.js.map