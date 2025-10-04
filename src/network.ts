import { exec, execSync } from "child_process";
import ping from "ping";
import deasync from "deasync";

type WifiConnectResult = {
  success: boolean;
  error?: string;
};

type PingResult = {
  host: string;
  alive: boolean;
  time: number | null;
  numeric_host: string | null;
  details: object | null;
  error?: string;
};

type PingCallback = (result: PingResult) => void;

type WifiProfile = {
  name: string | null;
  ssid: string | null;
  networkType: string | null;
  radioType: string | null;
  authentication: string | null;
  cipher: string | null;
  keyContent: string | null;
  raw: Record<string, string | number | boolean>;
} | null;

type BSSID = {
  bssid: string;
  signal?: string;
  radioType?: string;
  channel?: string;
  basicRatesMbps?: string;
  otherRatesMbps?: string;
  [key: string]: string | undefined;
};

type WifiNetwork = {
  interfaceName?: string;
  ssid?: string;
  networkType?: string;
  authentication?: string;
  encryption?: string;
  bssids: BSSID[];
};

type NetworkInterface = {
  name: string;
  description?: string;
  physicalAddress?: string;
  dHCPEnabled?: string;
  autoconfigurationEnabled?: string;
  linkLocalIPv6Address?: string;
  iPv4Address?: string;
  subnetMask?: string;
  defaultGateway?: string;
  dHCPServer?: string;
  dHCPv6IAID?: string;
  dHCPv6ClientDUID?: string;
  dNSServers?: string | string[];
  leaseObtained?: string;
  leaseExpires?: string;
  mediaState?: string;
  connectionSpecificDNSSuffix?: string;
  netBIOSOverTcpip?: string;
};

function parseWifiProfile(output: string) {
  const lines = output
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const result: Record<string, any> = {};

  function normalizeValue(value: string): any {
    const v = value.toLowerCase();
    if (["yes", "present", "enabled"].includes(v)) return true;
    if (["no", "not present", "disabled"].includes(v)) return false;

    if (!isNaN(Number(value))) return Number(value);

    return value;
  }

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*:\s*(.*)$/);
    if (match) {
      const key = match[1]
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[- ]+([a-zA-Z0-9])/g, (_, c) => c.toUpperCase())
        .replace(/^([A-Z])/, (m) => m.toLowerCase());
      const value = match[2].trim().replace(/^"|"$/g, "");
      result[key] = normalizeValue(value);
    }
  }

  return {
    name: result.name ?? null,
    ssid: result.ssidName ?? result.sSIDName ?? null,
    networkType: result.networkType ?? null,
    radioType: result.radioType ?? null,
    authentication: result.authentication ?? null,
    cipher: result.cipher ?? null,
    keyContent: result.keyContent ?? null,
    raw: result,
  };
}

function parsePingOutput(output: string) {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line);

  let stats: any = {};
  for (let line of lines) {
    if (line.toLowerCase().startsWith("packets:")) {
      const match = line.match(
        /Sent\s*=\s*(\d+),\s*Received\s*=\s*(\d+),\s*Lost\s*=\s*(\d+)/i
      );
      if (match) {
        stats.packets = {
          sent: Number(match[1]),
          received: Number(match[2]),
          lost: Number(match[3]),
        };
      }
    }

    if (line.toLowerCase().startsWith("minimum =")) {
      const match = line.match(
        /Minimum\s*=\s*(\d+)ms,\s*Maximum\s*=\s*(\d+)ms,\s*Average\s*=\s*(\d+)ms/i
      );
      if (match) {
        stats.times = {
          min: Number(match[1]),
          max: Number(match[2]),
          avg: Number(match[3]),
        };
      }
    }
  }

  return stats;
}

function convertPingResultToJson(res: any) {
  if (!res || !res.alive) {
    return {
      host: res?.host || null,
      alive: false,
      time: null,
      numeric_host: res?.numeric_host || null,
      details: null,
    };
  }

  const stats = parsePingOutput(res.output);

  return {
    host: res.host,
    alive: res.alive,
    time: Number(res.time) || null,
    numeric_host: res.numeric_host,
    details: stats,
  };
}

function parseWifiNetworks(output: string): WifiNetwork[] {
  const lines = output.split(/\r?\n/);
  const networks: WifiNetwork[] = [];
  let currentNetwork: WifiNetwork | null = null;
  let currentBSSID: BSSID | null = null;

  const trimKey = (key: string) =>
    key
      .replace(/\.+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[- ]+([a-zA-Z0-9])/g, (_, chr) => chr.toUpperCase())
      .replace(/^([A-Z])/, (m) => m.toLowerCase());

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const ssidMatch = line.match(/^SSID\s+\d+\s+:\s+(.*)$/i);
    if (ssidMatch) {
      if (currentNetwork) networks.push(currentNetwork);
      currentNetwork = { ssid: ssidMatch[1], bssids: [] };
      currentBSSID = null;
      continue;
    }

    const interfaceMatch = line.match(/^Interface name\s+:\s+(.*)$/i);
    if (interfaceMatch) {
      if (currentNetwork) networks.push(currentNetwork);
      currentNetwork = { interfaceName: interfaceMatch[1], bssids: [] };
      currentBSSID = null;
      continue;
    }

    const bssidMatch = line.match(/^BSSID\s+\d+\s+:\s+(.*)$/i);
    if (bssidMatch && currentNetwork) {
      currentBSSID = { bssid: bssidMatch[1] };
      currentNetwork.bssids.push(currentBSSID);
      continue;
    }

    const kvMatch = line.match(/^(.+?)\s+:\s+(.*)$/);
    if (kvMatch) {
      const key = trimKey(kvMatch[1]);
      const value = kvMatch[2].trim();

      if (currentBSSID) {
        currentBSSID[key] = value;
      } else if (currentNetwork) {
        (currentNetwork as any)[key] = value;
      }
    }
  }

  if (currentNetwork) networks.push(currentNetwork);
  return networks;
}

function toCamelCase(str: string): string {
  return str
    .replace(/\.+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[- ]+([a-zA-Z0-9])/g, (_, chr) => chr.toUpperCase())
    .replace(/^([A-Z])/, (m) => m.toLowerCase());
}

function parseIpconfig(output: string) {
  const lines = output.split(/\r?\n/);
  const adapters: any[] = [];
  let currentAdapter: any = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (/adapter/i.test(line)) {
      if (currentAdapter) adapters.push(currentAdapter);
      currentAdapter = { name: line.replace(":", "") };
    } else if (currentAdapter) {
      const match = line.match(/^(.+?)\s*:\s*(.*)$/);
      if (match) {
        const key = toCamelCase(match[1]);
        const value = match[2].trim();

        if (currentAdapter[key]) {
          if (Array.isArray(currentAdapter[key])) {
            currentAdapter[key].push(value);
          } else {
            currentAdapter[key] = [currentAdapter[key], value];
          }
        } else {
          currentAdapter[key] = value;
        }
      }
    }
  }

  if (currentAdapter) adapters.push(currentAdapter);
  return adapters;
}

class Sync {
  static connectWifi(
    profileName: string,
    interfaceName: string = "Wi‑Fi"
  ): WifiConnectResult {
    try {
      execSync(
        `netsh wlan connect name="${profileName}" interface="${interfaceName}"`,
        { stdio: "ignore" }
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
  static disconnectWifi(): boolean {
    try {
      execSync(`netsh wlan disconnect`, { stdio: "ignore" });
      return true;
    } catch (err) {
      return false;
    }
  }
  static wifiProfile(ssid: string): WifiProfile {
    try {
      const stdout = execSync(
        `netsh wlan show profile name="${ssid}" key=clear`,
        { encoding: "utf8" }
      );
      return parseWifiProfile(stdout);
    } catch (err) {
      return null;
    }
  }
  static interfaces(): NetworkInterface[] {
    try {
      const raw = execSync("ipconfig /all", {
        encoding: "utf8",
      });
      return parseIpconfig(raw);
    } catch {
      return [];
    }
  }

  static ping(hosts: string | string[], callback: PingCallback): PingResult[] {
    const hostList = Array.isArray(hosts) ? hosts : [hosts];
    const results: PingResult[] = [];

    hostList.forEach((host) => {
      let result: any = null;
      let done = false;

      ping.promise
        .probe(host, { timeout: 5 })
        .then((res) => {
          result = res;
          done = true;
        })
        .catch(() => {
          result = {
            host,
            alive: false,
            time: null,
            output: "",
            numeric_host: null,
            error: "Ping failed",
          };
          done = true;
        });

      while (!done) {
        deasync.sleep(100);
      }

      const jsonResult = convertPingResultToJson(result);
      callback(jsonResult);
      results.push(jsonResult);
    });

    return results;
  }

  static wifiNetworks(): WifiNetwork[] {
    try {
      const raw = execSync("netsh wlan show networks mode=bssid", {
        encoding: "utf8",
      });
      return parseWifiNetworks(raw);
    } catch {
      return [];
    }
  }
}

class Async {
  static connectWifi(
    profileName: string,
    interfaceName: string = "Wi‑Fi"
  ): Promise<WifiConnectResult> {
    return new Promise((resolve) => {
      exec(
        `netsh wlan connect name="${profileName}" interface="${interfaceName}"`,
        { encoding: "utf8" },
        (err) => {
          if (err) {
            return resolve({ success: false, error: err.message });
          }
          resolve({ success: true });
        }
      );
    });
  }

  static disconnectWifi(): Promise<boolean> {
    return new Promise((resolve) => {
      exec(`netsh wlan disconnect`, { encoding: "utf8" }, (err) => {
        resolve(!err);
      });
    });
  }
  static async wifiProfile(ssid: string): Promise<WifiProfile> {
    return new Promise((resolve) => {
      exec(
        `netsh wlan show profile name="${ssid}" key=clear`,
        { encoding: "utf8" },
        (err, stdout) => {
          if (err) {
            return resolve(null);
          }
          resolve(parseWifiProfile(stdout));
        }
      );
    });
  }

  static interfaces(): Promise<NetworkInterface[]> {
    return new Promise((resolve, reject) => {
      exec("ipconfig /all", (err, stdout) => {
        if (err) return reject(err);
        resolve(parseIpconfig(stdout));
      });
    });
  }

  static async ping(
    hosts: string | string[],
    callback?: PingCallback
  ): Promise<PingResult[]> {
    const hostList = Array.isArray(hosts) ? hosts : [hosts];

    const results: PingResult[] = await Promise.all(
      hostList.map(async (host) => {
        try {
          const res = await ping.promise.probe(host, { timeout: 5 });
          const jsonResult = convertPingResultToJson(res);
          if (callback) callback(jsonResult);
          return jsonResult;
        } catch {
          const failed: PingResult = {
            host,
            alive: false,
            time: null,
            numeric_host: null,
            details: null,
            error: "Ping failed",
          };
          if (callback) callback(failed);
          return failed;
        }
      })
    );

    return results;
  }

  static wifiNetworks(): Promise<WifiNetwork[]> {
    return new Promise((resolve, reject) => {
      exec("netsh wlan show networks mode=bssid", (err, stdout) => {
        if (err) return reject(err);
        resolve(parseWifiNetworks(stdout));
      });
    });
  }
}

export default class Network {
  static readonly sync = Sync;
  static readonly async = Async;
}
