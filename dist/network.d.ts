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
declare class Sync {
    static connectWifi(profileName: string, interfaceName?: string): WifiConnectResult;
    static disconnectWifi(): boolean;
    static wifiProfile(ssid: string): WifiProfile;
    static interfaces(): NetworkInterface[];
    static ping(hosts: string | string[], callback: PingCallback): PingResult[];
    static wifiNetworks(): WifiNetwork[];
}
declare class Async {
    static connectWifi(profileName: string, interfaceName?: string): Promise<WifiConnectResult>;
    static disconnectWifi(): Promise<boolean>;
    static wifiProfile(ssid: string): Promise<WifiProfile>;
    static interfaces(): Promise<NetworkInterface[]>;
    static ping(hosts: string | string[], callback?: PingCallback): Promise<PingResult[]>;
    static wifiNetworks(): Promise<WifiNetwork[]>;
}
export default class Network {
    static readonly sync: typeof Sync;
    static readonly async: typeof Async;
}
export {};
//# sourceMappingURL=network.d.ts.map