type Rule = {
    name: string;
    direction?: "Inbound" | "Outbound";
    action?: "Allow" | "Block";
    protocol?: "TCP" | "UDP" | "Any";
    localPort?: number | string;
    remoteAddress?: string;
};
type FirewallResult = {
    success: boolean;
    error?: string;
};
type ListRulesResult = {
    success: boolean;
    rules?: string[];
    error?: string;
};
declare class Async {
    private static runCommand;
    static addRule(rule: Rule): Promise<FirewallResult>;
    static removeRule(name: string): Promise<FirewallResult>;
    static listRules(): Promise<ListRulesResult>;
}
declare class Sync {
    private static runCommand;
    static addRule(rule: Rule): FirewallResult;
    static removeRule(name: string): FirewallResult;
    static listRules(): {
        success: boolean;
        rules?: string[];
        error?: string;
    };
}
export default class Firewall {
    static readonly Sync: typeof Sync;
    static readonly Async: typeof Async;
}
export {};
//# sourceMappingURL=firewall.d.ts.map