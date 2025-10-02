import Regedit from "./regedit";
import Taskmgr from "./taskmgr";
import FileSystem from "./filesystem";
import SystemInfo from "./systeminfo";
import UserManager from "./usermanager";

export default class ManageOS {
  static readonly Regedit = Regedit;
  static readonly Taskmgr = Taskmgr;
  static readonly FileSystem = FileSystem;
  static readonly SystemInfo = SystemInfo;
  static readonly UserManager = UserManager;
}
