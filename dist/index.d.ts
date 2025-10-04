import Regedit from "./regedit";
import Taskmgr from "./taskmgr";
import FileSystem from "./filesystem";
import SystemInfo from "./systeminfo";
import Users from "./users";
import Network from "./network";
import Clipboard from "./clipboard";
import Audio from "./audio";
import Notification from "./notification";
import Screen from "./screen";
import Power from "./power";
import Services from "./services";
import Firewall from "./firewall";
import UAC from "./uac";
import Encryption from "./encryption";
export default class ManageOS {
    static readonly Regedit: typeof Regedit;
    static readonly Taskmgr: typeof Taskmgr;
    static readonly FileSystem: typeof FileSystem;
    static readonly SystemInfo: typeof SystemInfo;
    static readonly Users: typeof Users;
    static readonly Network: typeof Network;
    static readonly Clipboard: typeof Clipboard;
    static readonly Audio: typeof Audio;
    static readonly Notification: typeof Notification;
    static readonly Screen: typeof Screen;
    static readonly Power: typeof Power;
    static readonly Services: typeof Services;
    static readonly Firewall: typeof Firewall;
    static readonly UAC: typeof UAC;
    static readonly Encryption: typeof Encryption;
}
//# sourceMappingURL=index.d.ts.map