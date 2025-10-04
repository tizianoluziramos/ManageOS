import notifier, { Notification as NotifierNotification } from "node-notifier";
import path from "path";

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

class Async {
  /**
   * Send a fully customizable native desktop notification asynchronously
   */
  static async sendNotification(
    options: NotificationOptions
  ): Promise<NotificationResult> {
    return new Promise((resolve) => {
      try {
        if (options.iconPath) {
          options.icon = path.resolve(options.iconPath);
        }
        notifier.notify(options, (err) => {
          resolve({
            success: !err,
            error:
              err instanceof Error
                ? err
                : err
                ? new Error(String(err))
                : undefined,
          });
        });
      } catch (error) {
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
  static async sendNotificationWithCallback(
    options: NotificationOptions
  ): Promise<{ error: Error | null; response: string }> {
    return new Promise((resolve) => {
      try {
        if (options.iconPath) {
          options.icon = path.resolve(options.iconPath);
        }
        notifier.notify(options, (err, response) => {
          resolve({
            error:
              err instanceof Error ? err : err ? new Error(String(err)) : null,
            response: response || "",
          });
        });
      } catch (error) {
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
  static async on(
    event: "click" | "timeout" | string,
    listener: (...args: any[]) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      notifier.on(event, listener);
      resolve();
    });
  }

  /**
   * Remove a specific listener for an event asynchronously
   */
  static async off(
    event: "click" | "timeout" | string,
    listener: (...args: any[]) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      notifier.removeListener(event, listener);
      resolve();
    });
  }

  /**
   * Remove all listeners for an event asynchronously
   */
  static async removeAllListeners(event?: string): Promise<void> {
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
  static sendNotification(options: NotificationOptions): NotificationResult {
    try {
      if (options.iconPath) {
        options.icon = path.resolve(options.iconPath);
      }
      notifier.notify(options);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Send a notification with a callback
   */
  static sendNotificationWithCallback(
    options: NotificationOptions,
    callback: (error: Error | null, response: string) => void
  ): void {
    try {
      if (options.iconPath) {
        options.icon = path.resolve(options.iconPath);
      }
      notifier.notify(options, callback);
    } catch (error) {
      callback(error instanceof Error ? error : new Error(String(error)), "");
    }
  }

  /**
   * Listen to notifier events (click, timeout, etc.)
   */
  static on(
    event: "click" | "timeout" | string,
    listener: (...args: any[]) => void
  ): void {
    notifier.on(event, listener);
  }

  /**
   * Remove a specific listener for an event
   */
  static off(
    event: "click" | "timeout" | string,
    listener: (...args: any[]) => void
  ): void {
    notifier.removeListener(event, listener);
  }

  /**
   * Remove all listeners for an event
   */
  static removeAllListeners(event?: string): void {
    notifier.removeAllListeners(event);
  }
}

export default class Notification {
  public readonly Sync = Sync;
  public readonly Async = Async;
}
