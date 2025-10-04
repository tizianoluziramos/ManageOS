"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_notifier_1 = __importDefault(require("node-notifier"));
const path_1 = __importDefault(require("path"));
class Async {
    /**
     * Send a fully customizable native desktop notification asynchronously
     */
    static async sendNotification(options) {
        return new Promise((resolve) => {
            try {
                if (options.iconPath) {
                    options.icon = path_1.default.resolve(options.iconPath);
                }
                node_notifier_1.default.notify(options, (err) => {
                    resolve({
                        success: !err,
                        error: err instanceof Error
                            ? err
                            : err
                                ? new Error(String(err))
                                : undefined,
                    });
                });
            }
            catch (error) {
                resolve({
                    success: false,
                    error: error instanceof Error ? error : new Error(String(error)),
                });
            }
        });
    }
    /**
     * Send a notification with a callback asynchronously
     */
    static async sendNotificationWithCallback(options) {
        return new Promise((resolve) => {
            try {
                if (options.iconPath) {
                    options.icon = path_1.default.resolve(options.iconPath);
                }
                node_notifier_1.default.notify(options, (err, response) => {
                    resolve({
                        error: err instanceof Error ? err : err ? new Error(String(err)) : null,
                        response: response || "",
                    });
                });
            }
            catch (error) {
                resolve({
                    error: error instanceof Error ? error : new Error(String(error)),
                    response: "",
                });
            }
        });
    }
    /**
     * Listen to notifier events (click, timeout, etc.) asynchronously
     */
    static async on(event, listener) {
        return new Promise((resolve) => {
            node_notifier_1.default.on(event, listener);
            resolve();
        });
    }
    /**
     * Remove a specific listener for an event asynchronously
     */
    static async off(event, listener) {
        return new Promise((resolve) => {
            node_notifier_1.default.removeListener(event, listener);
            resolve();
        });
    }
    /**
     * Remove all listeners for an event asynchronously
     */
    static async removeAllListeners(event) {
        return new Promise((resolve) => {
            node_notifier_1.default.removeAllListeners(event);
            resolve();
        });
    }
}
class Sync {
    /**
     * Send a fully customizable native desktop notification
     */
    static sendNotification(options) {
        try {
            if (options.iconPath) {
                options.icon = path_1.default.resolve(options.iconPath);
            }
            node_notifier_1.default.notify(options);
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    /**
     * Send a notification with a callback
     */
    static sendNotificationWithCallback(options, callback) {
        try {
            if (options.iconPath) {
                options.icon = path_1.default.resolve(options.iconPath);
            }
            node_notifier_1.default.notify(options, callback);
        }
        catch (error) {
            callback(error instanceof Error ? error : new Error(String(error)), "");
        }
    }
    /**
     * Listen to notifier events (click, timeout, etc.)
     */
    static on(event, listener) {
        node_notifier_1.default.on(event, listener);
    }
    /**
     * Remove a specific listener for an event
     */
    static off(event, listener) {
        node_notifier_1.default.removeListener(event, listener);
    }
    /**
     * Remove all listeners for an event
     */
    static removeAllListeners(event) {
        node_notifier_1.default.removeAllListeners(event);
    }
}
class Notification {
    Sync = Sync;
    Async = Async;
}
exports.default = Notification;
//# sourceMappingURL=notification.js.map