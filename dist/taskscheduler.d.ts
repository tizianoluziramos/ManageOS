export interface TaskInfo {
    Folder?: string;
    HostName?: string;
    TaskName?: string;
    NextRunTime?: string;
    Status?: string;
    LogonMode?: string;
    LastRunTime?: string;
    LastResult?: string;
    Author?: string;
    TaskToRun?: string;
    StartIn?: string;
    Comment?: string;
    ScheduledTaskState?: string;
    IdleTime?: string;
    PowerManagement?: string;
    RunAsUser?: string;
    DeleteTaskIfNotRescheduled?: string;
    StopTaskIfRunsXHoursXMins?: string;
    Schedule?: string;
    ScheduleType?: string;
    StartTime?: string;
    StartDate?: string;
    EndDate?: string;
    Days?: string;
    Months?: string;
    RepeatEvery?: string;
    RepeatUntilTime?: string;
    RepeatUntilDuration?: string;
    RepeatStopIfStillRunning?: string;
}
declare class Async {
    static exists(name: string): Promise<boolean>;
    static getNextRunTime(name: string): Promise<string | null>;
    static update(name: string, options: {
        time?: string;
        command?: string;
    }): Promise<void>;
    static exportTasks(filePath: string): Promise<void>;
    static importTasks(filePath: string): Promise<void>;
    static activeTasks(): Promise<TaskInfo[]>;
    static create(name: string, time: string, command: string): Promise<void>;
    static delete(name: string): Promise<void>;
    static list(): Promise<TaskInfo[]>;
    static run(name: string): Promise<void>;
}
declare class Sync {
    static create(name: string, time: string, command: string): void;
    static delete(name: string): void;
    static list(): TaskInfo[];
    static run(name: string): void;
}
export default class TaskScheduler {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=taskscheduler.d.ts.map