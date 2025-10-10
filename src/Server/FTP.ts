import FtpServer, { FtpServerOptions } from "ftp-srv";

export interface FTPOptions {
  url?: string;
  port?: number;
  host?: string;
  folder: string;
  username?: string; // Usuario por defecto
  password?: string; // Contraseña por defecto
  pasvUrl?: string; // URL para conexiones pasivas
  anonymous?: boolean; // Permitir login anónimo

  // Callbacks personalizables
  onLogin?: (username: string, password: string) => boolean | Promise<boolean>;
  onStart?: (server: FtpServer) => void;
  onError?: (error: Error) => void;
  onConnection?: (username: string, address: string) => void;

  // Opciones de configuración FTP extra
  ftpOptions?: Partial<FtpServerOptions>;
}

// Definimos LoginDetails manualmente
interface LoginDetails {
  username: string;
  password: string;
}

class Async {
  static start(options: FTPOptions): Promise<FtpServer> {
    return new Promise((resolve, reject) => {
      try {
        const url =
          options.url ??
          `ftp://${options.host ?? "0.0.0.0"}:${options.port ?? 21}`;

        const server = new FtpServer({
          url,
          anonymous: options.anonymous ?? false,
          pasv_url: options.pasvUrl ?? options.host ?? "127.0.0.1",
          ...options.ftpOptions,
        });

        server.on(
          "login",
          async (data: LoginDetails, resolveLogin, rejectLogin) => {
            try {
              let authorized = false;

              if (typeof options.onLogin === "function") {
                authorized = await options.onLogin(
                  data.username,
                  data.password
                );
              } else {
                authorized =
                  data.username === options.username &&
                  data.password === options.password;
              }

              if (authorized) {
                resolveLogin({ root: options.folder });
              } else {
                rejectLogin(new Error("Invalid credentials"));
              }
            } catch (err) {
              rejectLogin(err as Error);
            }
          }
        );

        server.on("login", (connection) => {
          if (options.onConnection) {
            options.onConnection(
              connection.username ?? "unknown",
              connection.connection.ip
            );
          }
        });

        server
          .listen()
          .then(() => {
            if (options.onStart) options.onStart(server);
            resolve(server);
          })
          .catch((err: any) => {
            if (options.onError) options.onError(err);
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  }
}

class Sync {
  static start(options: FTPOptions): FtpServer | null {
    try {
      const url =
        options.url ??
        `ftp://${options.host ?? "0.0.0.0"}:${options.port ?? 21}`;

      const server = new FtpServer({
        url,
        anonymous: options.anonymous ?? false,
        pasv_url: options.pasvUrl ?? options.host ?? "127.0.0.1",
        ...options.ftpOptions,
      });

      server.on(
        "login",
        async (data: LoginDetails, resolveLogin, rejectLogin) => {
          try {
            let authorized = false;

            if (typeof options.onLogin === "function") {
              authorized = await options.onLogin(data.username, data.password);
            } else {
              authorized =
                data.username === options.username &&
                data.password === options.password;
            }

            if (authorized) {
              resolveLogin({ root: options.folder });
            } else {
              rejectLogin(new Error("Invalid credentials"));
            }
          } catch (err) {
            rejectLogin(err as Error);
          }
        }
      );

      server.on("login", (connection) => {
        if (options.onConnection) {
          options.onConnection(
            connection.username ?? "unknown",
            connection.connection.ip
          );
        }
      });

      server
        .listen()
        .then(() => {
          if (options.onStart) options.onStart(server);
        })
        .catch((err: any) => {
          if (options.onError) options.onError(err);
        });

      return server;
    } catch {
      return null;
    }
  }
}

export default class FTP {
  public static readonly Async = Async;
  public static readonly Sync = Sync;
}
