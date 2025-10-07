import si from "systeminformation";
export default class Screen {
    private static rotationHistory;
    private static resolutionHistory;
    private static lastScreenshotBuffer;
    static getMonitorSerial(displayIndex?: number): Promise<string | null>;
    static getManufacturer(displayIndex?: number): Promise<string | null>;
    static getMonitorIndexByName(name: string): Promise<number | null>;
    static isOrientationPortrait(displayIndex?: number): Promise<boolean | null>;
    static getTotalScreenArea(): Promise<number>;
    static getCombinedResolution(): Promise<{
        width: number;
        height: number;
    }>;
    static normalizeToSupportedResolution(width: number, height: number): {
        width: number;
        height: number;
    } | null;
    static suggestScaleForPPI(targetPpi: number): Promise<number | null>;
    static getPhysicalSizeInInches(displayIndex?: number): Promise<{
        widthIn: number;
        heightIn: number;
        diagonalIn: number;
    } | null>;
    static formatResolution(width: number, height: number): string;
    static findClosestRefreshRate(targetHz: number, displayIndex?: number): number | null;
    static isResolutionSupportedOnAnyDisplay(width: number, height: number): boolean;
    static setTemporaryResolution(width: number, height: number, durationMs: number): number;
    static watchBrightnessChange(callback: (b: number | null) => void, interval?: number): number;
    static captureAndCompareLast(): Promise<{
        diffPercent: number;
    } | null>;
    static saveLastScreenshotTo(path: string): Promise<boolean>;
    static listDisplaysByConnectionType(): Promise<{
        connection: string;
        displays: any[];
    }[]>;
    static getDisplayByUUID(displayIndex?: number): Promise<string | null>;
    static getAveragePPIAcrossDisplays(): Promise<number | null>;
    static listMonitorModels(): Promise<string[]>;
    static getDisplayIndexes(): Promise<number[]>;
    static findDisplayBySerial(serial: string): Promise<number | null>;
    static isDisplayPrimary(displayIndex?: number): Promise<boolean>;
    static toggleNightLight(enable: boolean): Promise<boolean>;
    static scheduleNightLight(onHour: number, offHour: number, checkIntervalMs?: number): number;
    static cancelNightLightSchedule(id?: number): void;
    static getDisplayModesForIndex(displayIndex?: number): {
        width: number;
        height: number;
        hz: number;
        color: number;
    }[];
    static getPixelCountPerDisplay(): Promise<{
        index: number;
        pixels: number;
    }[]>;
    static getTotalPixelCount(): Promise<number>;
    static isTouchEnabled(displayIndex?: number): Promise<boolean | null>;
    static turnOffDisplay(): Promise<boolean>;
    static wakeDisplay(): Promise<boolean>;
    static setDisplayPower(on: boolean): Promise<boolean>;
    static getMonitorRefreshCapability(displayIndex?: number): {
        minHz: number;
        maxHz: number;
    } | null;
    static findBestModeForAspectRatio(aspect: string): {
        width: number;
        height: number;
        hz: number;
        color: number;
    } | null;
    static formatDisplayInfoHumanReadable(): Promise<string>;
    static compareDisplaysByPPI(): Promise<{
        index: number;
        ppi: number;
    }[] | null>;
    static getLongestUptimeSinceResolutionChange(): number;
    static snapshotConfigs(saveFolder?: string): Promise<string | null>;
    static listInstalledMonitorDrivers(): Promise<string[]>;
    static watchResolutionChangeWithHistory(interval?: number): void;
    static getResolutionHistory(): {
        width: number;
        height: number;
        timestamp: number;
    }[];
    static isHDRSupported(): Promise<boolean>;
    static getAverageRefreshRate(): number;
    static getResolutionChangeRate(): number;
    static compareRefreshRates(modeA: {
        hz: number;
    }, modeB: {
        hz: number;
    }): "A" | "B" | "Equal";
    static getPPI(): Promise<number | null>;
    static setResolution(width: number, height: number): void;
    static autoResolutionByTime(dayRes: {
        w: number;
        h: number;
    }, nightRes: {
        w: number;
        h: number;
    }): void;
    static getPrimaryDisplay(): Promise<si.Systeminformation.GraphicsDisplayData | null>;
    static getMultiMonitorInfo(): Promise<{
        model: string;
        resolution: string;
        refreshRate: number | null;
        isMain: boolean;
    }[]>;
    static exportResolutionHistoryCSV(path: string): void;
    static resetDisplaySettings(): void;
    static autoResolutionByBrightness(dayRes: {
        w: number;
        h: number;
    }, nightRes: {
        w: number;
        h: number;
    }): void;
    static getEDID(displayIndex?: number): Promise<string | null>;
    static getConnectorType(displayIndex?: number): Promise<string | null>;
    static listColorProfiles(): Promise<string[]>;
    static applyColorProfile(profileName: string): Promise<boolean>;
    static calibrateColor(): Promise<boolean>;
    static scheduleResolutionChange(width: number, height: number, runAt: Date): number;
    static cancelScheduledChange(id: number): void;
    static getScaling(): Promise<number | null>;
    static setScaling(scalePercent: number): Promise<boolean>;
    static cloneDisplays(): Promise<boolean>;
    static extendToDisplay(displayIndex?: number): Promise<boolean>;
    static moveWindowToDisplay(windowHandle: number, displayIndex: number): boolean;
    static getAvailableRefreshRates(displayIndex?: number): number[];
    static setGamma(r: number, g: number, b: number): void;
    static getGamma(): {
        r: number;
        g: number;
        b: number;
    } | null;
    static enableAdaptiveSync(): Promise<boolean>;
    static disableAdaptiveSync(): Promise<boolean>;
    static setPrimaryDisplay(displayIndex?: number): Promise<boolean>;
    static getCableStatus(displayIndex?: number): Promise<"connected" | "disconnected" | "unknown">;
    static rescanDisplays(): Promise<boolean>;
    static setBrightness(value: number): Promise<void>;
    static rotateNext(): void;
    static exportDisplayInfo(path: string): Promise<void>;
    static watchMonitorChanges(callback: (count: number) => void, interval?: number): void;
    static getBrightness(): Promise<number | null>;
    static saveCurrentConfig(path: string): Promise<void>;
    static restoreConfig(path: string): Promise<void>;
    static isCurrentResolutionOptimal(): boolean;
    static watchDisplayChanges(callback: () => void, interval?: number): void;
    static compareAllResolutions(): {
        width: number;
        height: number;
    }[];
    static setRefreshRate(hz: number): void;
    static exportResolutionHistory(path: string): void;
    static setResolutionSafe(width: number, height: number): void;
    static setResolutionWithFallback(width: number, height: number): void;
    static getDisplaySummary(): Promise<{
        model: any;
        resolution: any;
        refreshRate: any;
        pixelDepth: any;
    }[]>;
    static watchRotationChange(degrees: number): void;
    static getRotationHistory(): {
        degrees: number;
        timestamp: number;
    }[];
    static restoreInitialResolution(): void;
    static rotateDisplay(degrees: number): void;
    static getSupportedOrientations(): string[];
    static getCurrentOrientation(): string;
    static getNumberOfDisplays(): Promise<number>;
    static compareResolutions(resA: {
        width: number;
        height: number;
    }, resB: {
        width: number;
        height: number;
    }): "A" | "B" | "Equal";
    static getColorDepth(): Promise<number | null>;
    static captureScreenshot(path?: string): Promise<void>;
    static watchResolutionChange(callback: (res: {
        width: number;
        height: number;
    }) => void, interval?: number): void;
    static getDisplayInfo(): Promise<any[]>;
    static isHighRefreshRate(): boolean;
    static getAspectRatio(): string;
    static supportsResolution(width: number, height: number): boolean;
    static getBestDisplayMode(): {
        width: number;
        height: number;
        hz: number;
        color: number;
    } | null;
    static hasResolutionChanged(last: {
        width: number;
        height: number;
    }): boolean;
    static hasDisplayModeChanged(last: {
        width: number;
        height: number;
        hz: number;
        color: number;
    }): boolean;
    static getBestResolution(): {
        width: number;
        height: number;
    } | null;
    static getCurrentResolution(): {
        width: number;
        height: number;
    };
    static getAllResolutions(): {
        width: number;
        height: number;
    }[];
    static getCurrentDisplayMode(): {
        width: number;
        height: number;
        hz: number;
        color: number;
    };
    static getAllDisplayModes(): {
        width: number;
        height: number;
        hz: number;
        color: number;
    }[];
}
//# sourceMappingURL=screen.d.ts.map