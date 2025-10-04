type ServiceInfo = {
    name: string;
    status: string;
};
type ServiceResult = {
    success: boolean;
    error?: string;
};
declare class Sync {
    static createService(config: {
        name: string;
        description?: string;
        scriptPath: string;
        args?: string[];
        cwd?: string;
        userName?: string;
        password?: string;
    }): ServiceResult;
    static list(): ServiceInfo[];
    static start(serviceName: string): ServiceResult;
    static stop(serviceName: string): ServiceResult;
    static restart(serviceName: string): ServiceResult;
    static enable(serviceName: string): ServiceResult;
    static disable(serviceName: string): ServiceResult;
    static status(serviceName: string): {
        status: string;
        error?: string;
    };
    static install(scriptPath: string, serviceName: string, description?: string): ServiceResult;
    static uninstall(serviceName: string): ServiceResult;
}
declare class Async {
    static createService(config: {
        name: string;
        description?: string;
        scriptPath: string;
        args?: string[];
        cwd?: string;
        userName?: string;
        password?: string;
    }): Promise<ServiceResult>;
    static list(): Promise<ServiceInfo[]>;
    static start(serviceName: string): Promise<ServiceResult>;
    static stop(serviceName: string): Promise<ServiceResult>;
    static restart(serviceName: string): Promise<ServiceResult>;
    static enable(serviceName: string): Promise<ServiceResult>;
    static disable(serviceName: string): Promise<ServiceResult>;
    static status(serviceName: string): Promise<{
        status: string;
        error?: string;
    }>;
    static install(scriptPath: string, serviceName: string, description?: string): Promise<ServiceResult>;
    static uninstall(serviceName: string): Promise<ServiceResult>;
}
export default class Services {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=services.d.ts.map