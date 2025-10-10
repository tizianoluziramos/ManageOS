import FtpServer, { FtpServerOptions } from "ftp-srv";
export interface FTPOptions {
    url?: string;
    port?: number;
    host?: string;
    folder: string;
    username?: string;
    password?: string;
    pasvUrl?: string;
    anonymous?: boolean;
    onLogin?: (username: string, password: string) => boolean | Promise<boolean>;
    onStart?: (server: FtpServer) => void;
    onError?: (error: Error) => void;
    onConnection?: (username: string, address: string) => void;
    ftpOptions?: Partial<FtpServerOptions>;
}
declare class Async {
    static start(options: FTPOptions): Promise<FtpServer>;
}
declare class Sync {
    static start(options: FTPOptions): FtpServer | null;
}
export default class FTP {
    static readonly Async: typeof Async;
    static readonly Sync: typeof Sync;
}
export {};
//# sourceMappingURL=FTP.d.ts.map