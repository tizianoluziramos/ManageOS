type EventLogEntry = {
    index?: number;
    timeGenerated?: string;
    entryType?: string;
    source?: string;
    message?: string;
};
type EventLogResult = {
    success: boolean;
    error?: string;
    output?: string;
    data?: EventLogEntry[];
};
declare class Async {
    static list(logName?: string, maxEvents?: number): Promise<EventLogResult>;
    static listSystemEvents(maxEvents?: number): Promise<EventLogResult>;
    static listApplicationEvents(maxEvents?: number): Promise<EventLogResult>;
    static listSecurityEvents(maxEvents?: number): Promise<EventLogResult>;
    static watch(logName: string | undefined, callback: (entry: EventLogEntry) => void): void;
}
declare class Sync {
    static list(logName?: string, maxEvents?: number): EventLogResult;
    static listSystemEvents(maxEvents?: number): EventLogResult;
    static listApplicationEvents(maxEvents?: number): EventLogResult;
    static listSecurityEvents(maxEvents?: number): EventLogResult;
}
export default class EventLogs {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
    static exportToJson(data: EventLogEntry[], path: string): void;
    static exportToCsv(data: EventLogEntry[], path: string): void;
}
export {};
//# sourceMappingURL=eventlogs.d.ts.map