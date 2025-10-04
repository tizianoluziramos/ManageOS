import {
  getCurrentResolution,
  getAvailableResolution,
} from "win-screen-resolution";

export default class Screen {
  static getCurrentResolution(): { width: number; height: number } {
    return getCurrentResolution();
  }

  static getAllResolutions(): { width: number; height: number }[] {
    return getAvailableResolution();
  }
}
