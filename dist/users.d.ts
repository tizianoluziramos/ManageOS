type UserList = string[];
type UserInfo = {
    username: string;
    fullName: string;
    comment: string;
    countryRegionCode: string;
    accountActive: string;
    accountExpires: string;
    passwordLastSet: string;
    passwordExpires: string;
    passwordChangeable: string;
    passwordRequired: string;
    userMayChangePassword: string;
    workstationsAllowed: string;
    logonScript: string;
    profilePath: string;
    homeDirectory: string;
    lastLogon: string;
    logonHoursAllowed: string;
    localGroupMemberships: string[];
    globalGroupMemberships: string[];
};
type CommandResult = {
    success: boolean;
    output?: string;
    error?: string;
};
export default class Users {
    private static parseDate;
    private static cache;
    private static CACHE_TTL_MS;
    private static escapeArg;
    private static execCommand;
    private static parseSectionedOutput;
    static doesUserExist(username: string): boolean;
    static lockUser(username: string): CommandResult;
    static unlockUser(username: string): CommandResult;
    static setUserComment(username: string, comment: string): CommandResult;
    static getLastLogon(username: string): CommandResult;
    static createUser(username: string, password?: string): CommandResult;
    static deleteUser(username: string): CommandResult;
    static changePassword(username: string, newPassword: string): CommandResult;
    static setUserActive(username: string, active: boolean): CommandResult;
    static requirePasswordChange(username: string, require: boolean): CommandResult;
    static addUserToGroup(username: string, group: string): CommandResult;
    static removeUserFromGroup(username: string, group: string): CommandResult;
    static listUsers(): UserList;
    static listGroups(): string[];
    static listGroupMembers(groupName: string): string[] | string | undefined;
    static userExists(username: string): boolean;
    static getUserInfo(username: string): UserInfo | null;
    static getAllUsersInfo(): UserInfo[];
    static getAllGroupMembers(): {
        group: string;
        members: string[];
    }[];
    static getUserGroups(username: string): string[];
    static listActiveSessions(): string[];
    static currentUser(): string;
}
export {};
//# sourceMappingURL=users.d.ts.map