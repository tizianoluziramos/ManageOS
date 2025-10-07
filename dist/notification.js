import notifier from "node-notifier";
import path from "path";
class Async {
    /**
     * Send a fully customizable native desktop notification asynchronously
     */
    static async sendNotification(options) {
        return new Promise((resolve) => {
            try {
                if (options.iconPath) {
                    options.icon = path.resolve(options.iconPath);
                }
                notifier.notify(options, (err) => {
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
                    options.icon = path.resolve(options.iconPath);
                }
                notifier.notify(options, (err, response) => {
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
            notifier.on(event, listener);
            resolve();
        });
    }
    /**
     * Remove a specific listener for an event asynchronously
     */
    static async off(event, listener) {
        return new Promise((resolve) => {
            notifier.removeListener(event, listener);
            resolve();
        });
    }
    /**
     * Remove all listeners for an event asynchronously
     */
    static async removeAllListeners(event) {
        return new Promise((resolve) => {
            notifier.removeAllListeners(event);
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
                options.icon = path.resolve(options.iconPath);
            }
            notifier.notify(options);
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
                options.icon = path.resolve(options.iconPath);
            }
            notifier.notify(options, callback);
        }
        catch (error) {
            callback(error instanceof Error ? error : new Error(String(error)), "");
        }
    }
    /**
     * Listen to notifier events (click, timeout, etc.)
     */
    static on(event, listener) {
        notifier.on(event, listener);
    }
    /**
     * Remove a specific listener for an event
     */
    static off(event, listener) {
        notifier.removeListener(event, listener);
    }
    /**
     * Remove all listeners for an event
     */
    static removeAllListeners(event) {
        notifier.removeAllListeners(event);
    }
}
export default class Notification {
    Sync = Sync;
    Async = Async;
}
//# sourceMappingURL=notification.js.map