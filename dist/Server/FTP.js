import FtpServer from "ftp-srv";
class Async {
    static start(options) {
        return new Promise((resolve, reject) => {
            try {
                const url = options.url ??
                    `ftp://${options.host ?? "0.0.0.0"}:${options.port ?? 21}`;
                const server = new FtpServer({
                    url,
                    anonymous: options.anonymous ?? false,
                    pasv_url: options.pasvUrl ?? options.host ?? "127.0.0.1",
                    ...options.ftpOptions,
                });
                server.on("login", async (data, resolveLogin, rejectLogin) => {
                    try {
                        let authorized = false;
                        if (typeof options.onLogin === "function") {
                            authorized = await options.onLogin(data.username, data.password);
                        }
                        else {
                            authorized =
                                data.username === options.username &&
                                    data.password === options.password;
                        }
                        if (authorized) {
                            resolveLogin({ root: options.folder });
                        }
                        else {
                            rejectLogin(new Error("Invalid credentials"));
                        }
                    }
                    catch (err) {
                        rejectLogin(err);
                    }
                });
                server.on("login", (connection) => {
                    if (options.onConnection) {
                        options.onConnection(connection.username ?? "unknown", connection.connection.ip);
                    }
                });
                server
                    .listen()
                    .then(() => {
                    if (options.onStart)
                        options.onStart(server);
                    resolve(server);
                })
                    .catch((err) => {
                    if (options.onError)
                        options.onError(err);
                    reject(err);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
}
class Sync {
    static start(options) {
        try {
            const url = options.url ??
                `ftp://${options.host ?? "0.0.0.0"}:${options.port ?? 21}`;
            const server = new FtpServer({
                url,
                anonymous: options.anonymous ?? false,
                pasv_url: options.pasvUrl ?? options.host ?? "127.0.0.1",
                ...options.ftpOptions,
            });
            server.on("login", async (data, resolveLogin, rejectLogin) => {
                try {
                    let authorized = false;
                    if (typeof options.onLogin === "function") {
                        authorized = await options.onLogin(data.username, data.password);
                    }
                    else {
                        authorized =
                            data.username === options.username &&
                                data.password === options.password;
                    }
                    if (authorized) {
                        resolveLogin({ root: options.folder });
                    }
                    else {
                        rejectLogin(new Error("Invalid credentials"));
                    }
                }
                catch (err) {
                    rejectLogin(err);
                }
            });
            server.on("login", (connection) => {
                if (options.onConnection) {
                    options.onConnection(connection.username ?? "unknown", connection.connection.ip);
                }
            });
            server
                .listen()
                .then(() => {
                if (options.onStart)
                    options.onStart(server);
            })
                .catch((err) => {
                if (options.onError)
                    options.onError(err);
            });
            return server;
        }
        catch {
            return null;
        }
    }
}
export default class FTP {
    static Async = Async;
    static Sync = Sync;
}
//# sourceMappingURL=FTP.js.map