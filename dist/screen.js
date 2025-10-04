"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const win_screen_resolution_1 = require("win-screen-resolution");
class Screen {
    static getCurrentResolution() {
        return (0, win_screen_resolution_1.getCurrentResolution)();
    }
    static getAllResolutions() {
        return (0, win_screen_resolution_1.getAvailableResolution)();
    }
}
exports.default = Screen;
//# sourceMappingURL=screen.js.map