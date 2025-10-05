import { execSync as originalExecSync, } from "child_process";
function execSync(command, options) {
    return originalExecSync(command, {
        encoding: "utf8",
        stdio: "pipe",
        ...options,
    });
}
export default class Users {
    static parseDate(output) {
        if (!output)
            return null;
        return output.replace(/\r/g, "").replace(/\n+/g, "").trim() || null;
    }
    static cache = {};
    static CACHE_TTL_MS = 5_000;
    static escapeArg(arg) {
        return `"${arg.replace(/"/g, '\\"')}"`;
    }
    static execCommand(command) {
        try {
            const output = execSync(command, { encoding: "utf8" });
            return { success: true, output };
        }
        catch (err) {
            const errorMsg = err instanceof Error
                ? err.message
                : typeof err === "string"
                    ? err
                    : JSON.stringify(err);
            return { success: false, error: errorMsg };
        }
    }
    static parseSectionedOutput(output) {
        const lines = output.split(/\r?\n/);
        const result = [];
        let collecting = false;
        for (let raw of lines) {
            const line = raw.replace(/\r$/, "");
            if (line.includes("-----")) {
                collecting = !collecting;
                continue;
            }
            if (!collecting)
                continue;
            if (/The command completed/i.test(line))
                continue;
            const candidate = line.trim();
            if (candidate) {
                result.push(candidate);
            }
        }
        return result;
    }
    static doesUserExist(username) {
        const res = this.execCommand(`net user ${this.escapeArg(username)}`);
        return res.success && !res.error;
    }
    static lockUser(username) {
        const escUser = this.escapeArg(username);
        return this.execCommand(`net user ${escUser} /lock`);
    }
    static unlockUser(username) {
        const escUser = this.escapeArg(username);
        return this.execCommand(`net user ${escUser} /active:yes`);
    }
    static setUserComment(username, comment) {
        const escUser = this.escapeArg(username);
        const escComment = this.escapeArg(comment);
        return this.execCommand(`net user ${escUser} /comment:${escComment}`);
    }
    static getLastLogon(username) {
        const escUser = username.replace(/'/g, "''"); // Escapa comillas simples
        const res = this.execCommand(`powershell -Command "Get-LocalUser -Name '${escUser}' | Select-Object -ExpandProperty LastLogon"`);
        if (!res.success || !res.output)
            return res;
        const isoDate = this.parseDate(res.output);
        return { success: true, output: isoDate ?? "" };
    }
    static createUser(username, password) {
        const escUser = this.escapeArg(username);
        const passPart = password !== undefined ? this.escapeArg(password) : '""';
        const res = this.execCommand(`net user ${escUser} ${passPart} /add`);
        if (res.success) {
            delete this.cache.users;
        }
        return res;
    }
    static deleteUser(username) {
        const escUser = this.escapeArg(username);
        const res = this.execCommand(`net user ${escUser} /delete`);
        if (res.success)
            delete this.cache.users;
        return res;
    }
    static changePassword(username, newPassword) {
        const escUser = this.escapeArg(username);
        const escPass = this.escapeArg(newPassword);
        return this.execCommand(`net user ${escUser} ${escPass}`);
    }
    static setUserActive(username, active) {
        const escUser = this.escapeArg(username);
        const res = this.execCommand(`net user ${escUser} /active:${active ? "yes" : "no"}`);
        if (res.success)
            delete this.cache.users;
        return res;
    }
    static requirePasswordChange(username, require) {
        const escUser = this.escapeArg(username);
        return this.execCommand(`net user ${escUser} /logonpasswordchg:${require ? "yes" : "no"}`);
    }
    static addUserToGroup(username, group) {
        const escUser = this.escapeArg(username);
        const escGroup = this.escapeArg(group);
        const res = this.execCommand(`net localgroup ${escGroup} ${escUser} /add`);
        if (res.success)
            delete this.cache.groups;
        return res;
    }
    static removeUserFromGroup(username, group) {
        const escUser = this.escapeArg(username);
        const escGroup = this.escapeArg(group);
        const res = this.execCommand(`net localgroup ${escGroup} ${escUser} /delete`);
        if (res.success)
            delete this.cache.groups;
        return res;
    }
    static listUsers() {
        const now = Date.now();
        if (this.cache.users &&
            now - this.cache.users.ts < this.CACHE_TTL_MS &&
            Array.isArray(this.cache.users.data)) {
            return this.cache.users.data.slice();
        }
        const res = this.execCommand("net user");
        if (!res.success || !res.output) {
            return [];
        }
        const parsed = this.parseSectionedOutput(res.output)
            .map((line) => line
            .trim()
            .split(/\s+/)
            .filter((u) => u &&
            u !== "The" &&
            u !== "command" &&
            u !== "completed" &&
            u !== "successfully."))
            .flat();
        this.cache.users = { data: parsed, ts: Date.now() };
        return parsed;
    }
    static listGroups() {
        const now = Date.now();
        if (this.cache.groups &&
            now - this.cache.groups.ts < this.CACHE_TTL_MS &&
            Array.isArray(this.cache.groups.data)) {
            return this.cache.groups.data.slice();
        }
        const res = this.execCommand("net localgroup");
        if (!res.success || !res.output) {
            return [];
        }
        const parsed = this.parseSectionedOutput(res.output)
            .map((l) => l.replace(/^\*/, "").trim())
            .filter(Boolean);
        this.cache.groups = { data: parsed, ts: Date.now() };
        return parsed;
    }
    static listGroupMembers(groupName) {
        const escGroup = this.escapeArg(groupName);
        const res = this.execCommand(`net localgroup ${escGroup}`);
        if (!res.success || !res.output) {
            return res.error;
        }
        const parsed = this.parseSectionedOutput(res.output)
            .map((line) => line.split(/\s+/).filter(Boolean))
            .flat();
        return parsed;
    }
    static userExists(username) {
        return this.listUsers().includes(username);
    }
    static getUserInfo(username) {
        const escUser = this.escapeArg(username);
        const res = this.execCommand(`net user ${escUser}`);
        if (!res.success || !res.output) {
            return null;
        }
        const lines = res.output.split(/\r?\n/).map((ln) => ln.replace(/\r$/, ""));
        const details = {};
        let currentKey = null;
        const knownKeys = [
            "User name",
            "Full Name",
            "Comment",
            "User's comment",
            "Country/region code",
            "Account active",
            "Account expires",
            "Password last set",
            "Password expires",
            "Password changeable",
            "Password required",
            "User may change password",
            "Workstations allowed",
            "Logon script",
            "User profile",
            "Home directory",
            "Last logon",
            "Logon hours allowed",
            "Local Group Memberships",
            "Global Group memberships",
        ];
        let collecting = false;
        for (let raw of lines) {
            const line = raw.trimEnd();
            if (line.startsWith("User name"))
                collecting = true;
            if (!collecting)
                continue;
            if (/The command completed/i.test(line))
                break;
            const match = line.match(/^([^:]+?)\s{2,}(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim();
                if (knownKeys.includes(key)) {
                    currentKey = key;
                    details[currentKey] = value;
                }
                else {
                    currentKey = null;
                }
            }
            else {
                const possibleKey = line.trim();
                if (knownKeys.includes(possibleKey)) {
                    currentKey = possibleKey;
                    details[currentKey] = "";
                }
                else if (currentKey) {
                    details[currentKey] = (details[currentKey] || "") + " " + line.trim();
                }
            }
        }
        return {
            username,
            fullName: details["Full Name"] || "",
            comment: details["Comment"] || details["User's comment"] || "",
            countryRegionCode: details["Country/region code"] || "",
            accountActive: details["Account active"] || "",
            accountExpires: details["Account expires"] || "",
            passwordLastSet: details["Password last set"] || "",
            passwordExpires: details["Password expires"] || "",
            passwordChangeable: details["Password changeable"] || "",
            passwordRequired: details["Password required"] || "",
            userMayChangePassword: details["User may change password"] || "",
            workstationsAllowed: details["Workstations allowed"] || "",
            logonScript: details["Logon script"] || "",
            profilePath: details["User profile"] || "",
            homeDirectory: details["Home directory"] || "",
            lastLogon: details["Last logon"] || "",
            logonHoursAllowed: details["Logon hours allowed"] || "",
            localGroupMemberships: (details["Local Group Memberships"] || "")
                .split(/\s+/)
                .filter(Boolean),
            globalGroupMemberships: (details["Global Group memberships"] || "")
                .split(/\s+/)
                .filter(Boolean),
        };
    }
    static getAllUsersInfo() {
        const users = this.listUsers();
        const allInfo = [];
        for (const u of users) {
            const info = this.getUserInfo(u);
            if (info)
                allInfo.push(info);
        }
        return allInfo;
    }
    static getAllGroupMembers() {
        const groups = this.listGroups();
        const result = [];
        for (const g of groups) {
            const members = this.listGroupMembers(g);
            result.push({ group: g, members: Array.isArray(members) ? members : [] });
        }
        return result;
    }
    static getUserGroups(username) {
        const allGroups = this.listGroups();
        const userGroups = [];
        for (const group of allGroups) {
            const members = this.listGroupMembers(group);
            if (Array.isArray(members) && members.includes(username)) {
                userGroups.push(group);
            }
        }
        return userGroups;
    }
    static listActiveSessions() {
        const res = this.execCommand('powershell -Command "Get-LocalUser | Where-Object {$_.Enabled -eq $true} | Select-Object -ExpandProperty Name"');
        if (!res.success || !res.output)
            return [];
        return res.output
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }
    static currentUser() {
        try {
            return execSync("whoami", { encoding: "utf8" }).trim();
        }
        catch (err) {
            return String(err);
        }
    }
}
//# sourceMappingURL=users.js.map