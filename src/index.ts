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
  static readonly Regedit = Regedit;
  static readonly Taskmgr = Taskmgr;
  static readonly FileSystem = FileSystem;
  static readonly SystemInfo = SystemInfo;
  static readonly Users = Users;
  static readonly Network = Network;
  static readonly Clipboard = Clipboard;
  static readonly Audio = Audio;
  static readonly Notification = Notification;
  static readonly Screen = Screen;
  static readonly Power = Power;
  static readonly Services = Services;
  static readonly Firewall = Firewall;
  static readonly UAC = UAC;
  static readonly Encryption = Encryption;
}
