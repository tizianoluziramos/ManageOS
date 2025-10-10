declare module "ssh2-sftp-server" {
  import { EventEmitter } from "events";
  import { Stats } from "fs";

  export interface LoginDetails {
    username: string;
    password: string;
  }

  export interface SFTPServerOptions {
    url: string;
    anonymous?: boolean;
    pasv_url?: string;
    hostKeys?: string[];
    [key: string]: any;
  }

  export interface SFTPFileAttrs extends Stats {
    mode: number;
    uid: number;
    gid: number;
    size: number;
    atime: number;
    mtime: number;
  }

  export interface SFTPFileEntry {
    filename: string;
    longname: string;
    attrs: SFTPFileAttrs;
  }

  export interface SFTPConnection {
    username?: string;
    ip: string;
  }

  export interface SFTPOpenFile {
    filepath: string;
    flags: string;
    stat: Stats;
    pos: number;
    closed?: boolean;
  }

  export interface SFTPHandle {
    [key: string]: SFTPOpenFile;
  }

  export class SFTP extends EventEmitter {
    constructor(sftpStream: any);

    openFiles: SFTPHandle;
    sftpStream: any;
    _handleCount: number;

    _open(reqid: any, filepath: string, flags: number, attrs?: any): void;
    _close(reqid: any, handle: any): void;
    _realpath(reqid: any, filename: string): void;
    _onSTAT(
      statType: string,
      reqid: any,
      remotepath: string,
      handle?: any
    ): void;
    _opendir(reqid: any, remotepath: string): void;
    _read(reqid: any, handle: any, offset: number, length: number): void;
    _rename(reqid: any, remotepath: string, newremotePath: string): void;
    _remove(reqid: any, remotepath: string): void;
    _rmdir(reqid: any, remotepath: string): void;
    _mkdir(reqid: any, remotepath: string): void;
    _readdir(reqid: any, handle: any): void;
    _write(reqid: any, handle: any, offset: number, data: Buffer): void;
  }

  export function getLogicalDisks(): Promise<string[]>;

  export function wslpath(p: string): string;
  export function winpath(p: string): string;
}
