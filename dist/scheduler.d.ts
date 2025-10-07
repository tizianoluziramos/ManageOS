type TaskInfo = {
    name: string;
    nextRunTime: string;
    status: string;
};
type TaskResult = {
    success: boolean;
    error?: string;
};
declare class Sync {
    static createTask(config: {
        name: string;
        scriptPath: string;
        schedule: "MINUTE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
        time?: string;
        args?: string[];
    }): TaskResult;
    static list(): TaskInfo[];
    static run(taskName: string): TaskResult;
    static delete(taskName: string): TaskResult;
}
declare class Async {
    static createTask(config: {
        name: string;
        scriptPath: string;
        schedule: "MINUTE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
        time?: string;
        args?: string[];
    }): Promise<TaskResult>;
    static list(): Promise<TaskInfo[]>;
    static run(taskName: string): Promise<TaskResult>;
    static delete(taskName: string): Promise<TaskResult>;
}
export default class Scheduler {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=scheduler.d.ts.map