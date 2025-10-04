interface FileInfo {
    name: string;
    path: string;
    size: string;
    isDirectory: boolean;
}
declare class Sync {
    static createFile(filePath: string, content?: string): boolean | unknown;
    static currentPath(): string;
    static listDirectory(dirPath: string): FileInfo[];
    static readFile(filePath: string): string;
    static deleteFile(filePath: string, force?: boolean): boolean | unknown;
    static createDirectory(dirPath: string): boolean | unknown;
    static deleteDirectory(dirPath: string, force?: boolean): boolean | unknown;
}
declare class Async {
    static currentPath(): string;
    static createFile(filePath: string, content?: string): Promise<boolean | unknown>;
    static listDirectory(dirPath: string): Promise<FileInfo[]>;
    static readFile(filePath: string): Promise<string>;
    static deleteFile(filePath: string, force?: boolean): Promise<boolean | unknown>;
    static createDirectory(dirPath: string): Promise<boolean | unknown>;
    static deleteDirectory(dirPath: string, force?: boolean): Promise<boolean | unknown>;
}
export default class FileSystem {
    static readonly async: typeof Async;
    static readonly sync: typeof Sync;
}
export {};
//# sourceMappingURL=filesystem.d.ts.map