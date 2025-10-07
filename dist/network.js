import { exec, execSync } from "child_process";
import ping from "ping";
import deasync from "deasync";
function parseWifiProfile(output) {
    const lines = output
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
    const result = {};
    function normalizeValue(value) {
        const v = value.toLowerCase();
        if (["yes", "present", "enabled"].includes(v))
            return true;
        if (["no", "not present", "disabled"].includes(v))
            return false;
        if (!isNaN(Number(value)))
            return Number(value);
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
function parsePingOutput(output) {
    const lines = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line);
    let stats = {};
    for (let line of lines) {
        if (line.toLowerCase().startsWith("packets:")) {
            const match = line.match(/Sent\s*=\s*(\d+),\s*Received\s*=\s*(\d+),\s*Lost\s*=\s*(\d+)/i);
            if (match) {
                stats.packets = {
                    sent: Number(match[1]),
                    received: Number(match[2]),
                    lost: Number(match[3]),
                };
            }
        }
        if (line.toLowerCase().startsWith("minimum =")) {
            const match = line.match(/Minimum\s*=\s*(\d+)ms,\s*Maximum\s*=\s*(\d+)ms,\s*Average\s*=\s*(\d+)ms/i);
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
function convertPingResultToJson(res) {
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
function parseWifiNetworks(output) {
    const lines = output.split(/\r?\n/);
    const networks = [];
    let currentNetwork = null;
    let currentBSSID = null;
    const trimKey = (key) => key
        .replace(/\.+/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[- ]+([a-zA-Z0-9])/g, (_, chr) => chr.toUpperCase())
        .replace(/^([A-Z])/, (m) => m.toLowerCase());
    for (let line of lines) {
        line = line.trim();
        if (!line)
            continue;
        const ssidMatch = line.match(/^SSID\s+\d+\s+:\s+(.*)$/i);
        if (ssidMatch) {
            if (currentNetwork)
                networks.push(currentNetwork);
            currentNetwork = { ssid: ssidMatch[1], bssids: [] };
            currentBSSID = null;
            continue;
        }
        const interfaceMatch = line.match(/^Interface name\s+:\s+(.*)$/i);
        if (interfaceMatch) {
            if (currentNetwork)
                networks.push(currentNetwork);
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
            }
            else if (currentNetwork) {
                currentNetwork[key] = value;
            }
        }
    }
    if (currentNetwork)
        networks.push(currentNetwork);
    return networks;
}
function toCamelCase(str) {
    return str
        .replace(/\.+/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[- ]+([a-zA-Z0-9])/g, (_, chr) => chr.toUpperCase())
        .replace(/^([A-Z])/, (m) => m.toLowerCase());
}
function parseIpconfig(output) {
    const lines = output.split(/\r?\n/);
    const adapters = [];
    let currentAdapter = null;
    for (let line of lines) {
        line = line.trim();
        if (!line)
            continue;
        if (/adapter/i.test(line)) {
            if (currentAdapter)
                adapters.push(currentAdapter);
            currentAdapter = { name: line.replace(":", "") };
        }
        else if (currentAdapter) {
            const match = line.match(/^(.+?)\s*:\s*(.*)$/);
            if (match) {
                const key = toCamelCase(match[1]);
                const value = match[2].trim();
                if (currentAdapter[key]) {
                    if (Array.isArray(currentAdapter[key])) {
                        currentAdapter[key].push(value);
                    }
                    else {
                        currentAdapter[key] = [currentAdapter[key], value];
                    }
                }
                else {
                    currentAdapter[key] = value;
                }
            }
        }
    }
    if (currentAdapter)
        adapters.push(currentAdapter);
    return adapters;
}
class Sync {
    static connectWifi(profileName, interfaceName = "Wi‑Fi") {
        try {
            execSync(`netsh wlan connect name="${profileName}" interface="${interfaceName}"`, { stdio: "ignore" });
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    static disconnectWifi() {
        try {
            execSync(`netsh wlan disconnect`, { stdio: "ignore" });
            return true;
        }
        catch (err) {
            return false;
        }
    }
    static wifiProfile(ssid) {
        try {
            const stdout = execSync(`netsh wlan show profile name="${ssid}" key=clear`, { encoding: "utf8" });
            return parseWifiProfile(stdout);
        }
        catch (err) {
            return null;
        }
    }
    static interfaces() {
        try {
            const raw = execSync("ipconfig /all", {
                encoding: "utf8",
            });
            return parseIpconfig(raw);
        }
        catch {
            return [];
        }
    }
    static ping(hosts, callback) {
        const hostList = Array.isArray(hosts) ? hosts : [hosts];
        const results = [];
        hostList.forEach((host) => {
            let result = null;
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
    static wifiNetworks() {
        try {
            const raw = execSync("netsh wlan show networks mode=bssid", {
                encoding: "utf8",
            });
            return parseWifiNetworks(raw);
        }
        catch {
            return [];
        }
    }
}
class Async {
    static connectWifi(profileName, interfaceName = "Wi‑Fi") {
        return new Promise((resolve) => {
            exec(`netsh wlan connect name="${profileName}" interface="${interfaceName}"`, { encoding: "utf8" }, (err) => {
                if (err) {
                    return resolve({ success: false, error: err.message });
                }
                resolve({ success: true });
            });
        });
    }
    static disconnectWifi() {
        return new Promise((resolve) => {
            exec(`netsh wlan disconnect`, { encoding: "utf8" }, (err) => {
                resolve(!err);
            });
        });
    }
    static async wifiProfile(ssid) {
        return new Promise((resolve) => {
            exec(`netsh wlan show profile name="${ssid}" key=clear`, { encoding: "utf8" }, (err, stdout) => {
                if (err) {
                    return resolve(null);
                }
                resolve(parseWifiProfile(stdout));
            });
        });
    }
    static interfaces() {
        return new Promise((resolve, reject) => {
            exec("ipconfig /all", (err, stdout) => {
                if (err)
                    return reject(err);
                resolve(parseIpconfig(stdout));
            });
        });
    }
    static async ping(hosts, callback) {
        const hostList = Array.isArray(hosts) ? hosts : [hosts];
        const results = await Promise.all(hostList.map(async (host) => {
            try {
                const res = await ping.promise.probe(host, { timeout: 5 });
                const jsonResult = convertPingResultToJson(res);
                if (callback)
                    callback(jsonResult);
                return jsonResult;
            }
            catch {
                const failed = {
                    host,
                    alive: false,
                    time: null,
                    numeric_host: null,
                    details: null,
                    error: "Ping failed",
                };
                if (callback)
                    callback(failed);
                return failed;
            }
        }));
        return results;
    }
    static wifiNetworks() {
        return new Promise((resolve, reject) => {
            exec("netsh wlan show networks mode=bssid", (err, stdout) => {
                if (err)
                    return reject(err);
                resolve(parseWifiNetworks(stdout));
            });
        });
    }
}
export default class Network {
    static sync = Sync;
    static async = Async;
}
//# sourceMappingURL=network.js.map