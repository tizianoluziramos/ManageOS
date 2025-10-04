import { Notification as NotifierNotification } from "node-notifier";
type NotificationOptions = NotifierNotification & {
    iconPath?: string;
    title?: string;
    message?: string;
    subtitle?: string;
    sound?: boolean | string;
    wait?: boolean;
    timeout?: number;
    closeLabel?: string;
    actions?: string[];
    dropdownLabel?: string;
    reply?: boolean;
    id?: number;
    open?: string;
    url?: string;
    contentImage?: string;
    launch?: string;
    type?: string;
    appID?: string;
};
/**
 * Notification result type
 */
type NotificationResult = {
    success: boolean;
    error?: Error;
};
declare class Async {
    /**
     * Send a fully customizable native desktop notification asynchronously
     */
    static sendNotification(options: NotificationOptions): Promise<NotificationResult>;
    /**
     * Send a notification with a callback asynchronously
     */
    static sendNotificationWithCallback(options: NotificationOptions): Promise<{
        error: Error | null;
        response: string;
    }>;
    /**
     * Listen to notifier events (click, timeout, etc.) asynchronously
     */
    static on(event: "click" | "timeout" | string, listener: (...args: any[]) => void): Promise<void>;
    /**
     * Remove a specific listener for an event asynchronously
     */
    static off(event: "click" | "timeout" | string, listener: (...args: any[]) => void): Promise<void>;
    /**
     * Remove all listeners for an event asynchronously
     */
    static removeAllListeners(event?: string): Promise<void>;
}
declare class Sync {
    /**
     * Send a fully customizable native desktop notification
     */
    static sendNotification(options: NotificationOptions): NotificationResult;
    /**
     * Send a notification with a callback
     */
    static sendNotificationWithCallback(options: NotificationOptions, callback: (error: Error | null, response: string) => void): void;
    /**
     * Listen to notifier events (click, timeout, etc.)
     */
    static on(event: "click" | "timeout" | string, listener: (...args: any[]) => void): void;
    /**
     * Remove a specific listener for an event
     */
    static off(event: "click" | "timeout" | string, listener: (...args: any[]) => void): void;
    /**
     * Remove all listeners for an event
     */
    static removeAllListeners(event?: string): void;
}
export default class Notification {
    readonly Sync: typeof Sync;
    readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=notification.d.ts.map