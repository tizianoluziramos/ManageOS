import {
  getCurrentResolution,
  getAvailableResolution,
  getCurrentDisplayMode,
  getAvailableDisplayMode,
} from "win-screen-resolution";
import si from "systeminformation";
import screenshot from "screenshot-desktop";
import { exec } from "child_process";

export default class Screen {
  private static rotationHistory: { degrees: number; timestamp: number }[] = [];

  private static resolutionHistory: {
    width: number;
    height: number;
    timestamp: number;
  }[] = [];

  // --- Propiedad auxiliar para capturas/comparaciones ---
  private static lastScreenshotBuffer: Buffer | null = null;

  // 1) Obtener serial del monitor (si está disponible)
  static async getMonitorSerial(displayIndex = 0): Promise<string | null> {
    const g = await si.graphics();
    return g.displays[displayIndex]?.serial || null;
  }

  // 2) Obtener fabricante del monitor (manufacturer)
  static async getManufacturer(displayIndex = 0): Promise<string | null> {
    const g = await si.graphics();
    const model = g.displays[displayIndex]?.model;
    if (!model) return null;
    // Ejemplo simple: extraer palabra inicial del modelo
    return model.split(" ")[0];
  }

  // 3) Buscar índice de monitor por nombre/modelo (first match)
  static async getMonitorIndexByName(name: string): Promise<number | null> {
    const g = await si.graphics();
    const idx = g.displays.findIndex((d) =>
      (d.model || "").toLowerCase().includes(name.toLowerCase())
    );
    return idx >= 0 ? idx : null;
  }

  // 4) Comprobar si la orientación actual es portrait para un display (usa resolución)
  static async isOrientationPortrait(
    displayIndex = 0
  ): Promise<boolean | null> {
    const g = await si.graphics();
    const d = g.displays[displayIndex];
    if (
      !d ||
      typeof d.currentResX !== "number" ||
      typeof d.currentResY !== "number"
    )
      return null;
    return d.currentResY > d.currentResX;
  }

  // 5) Area total en píxeles combinada (suma width*height de cada display)
  static async getTotalScreenArea(): Promise<number> {
    const g = await si.graphics();
    return g.displays.reduce((acc, d) => {
      const w = d.currentResX || 0;
      const h = d.currentResY || 0;
      return acc + w * h;
    }, 0);
  }

  // 6) Resolución combinada (bounding box) - total ancho máximo x suma de alturas (approx)
  static async getCombinedResolution(): Promise<{
    width: number;
    height: number;
  }> {
    const g = await si.graphics();
    const width = g.displays.reduce(
      (m, d) => Math.max(m, d.currentResX || 0),
      0
    );
    const height = g.displays.reduce((s, d) => s + (d.currentResY || 0), 0);
    return { width, height };
  }

  // 7) Normalizar una resolución a la más cercana soportada (devuelve la resolución soportada más parecida)
  static normalizeToSupportedResolution(
    width: number,
    height: number
  ): { width: number; height: number } | null {
    const all = this.getAllResolutions();
    if (!all.length) return null;
    let best = all[0];
    let bestDist =
      Math.abs(best.width - width) + Math.abs(best.height - height);
    for (const r of all) {
      const d = Math.abs(r.width - width) + Math.abs(r.height - height);
      if (d < bestDist) {
        bestDist = d;
        best = r;
      }
    }
    return { width: best.width, height: best.height };
  }

  // 8) Sugerir porcentaje de escala (DPI) aproximado para un PPI objetivo
  static async suggestScaleForPPI(targetPpi: number): Promise<number | null> {
    const ppi = await this.getPPI();
    if (!ppi) return null;
    // Windows scale roughly: scale% = (target / actual) * 100
    const scale = Math.round((targetPpi / ppi) * 100);
    // limitar entre 100 y 400
    return Math.min(400, Math.max(100, scale));
  }

  // 9) Tamaño físico aproximado en pulgadas (width, height, diagonal) para un display
  static async getPhysicalSizeInInches(
    displayIndex = 0
  ): Promise<{ widthIn: number; heightIn: number; diagonalIn: number } | null> {
    const g = await si.graphics();
    const d = g.displays[displayIndex];
    if (!d || typeof d.sizeX !== "number" || typeof d.sizeY !== "number")
      return null;
    const widthIn = d.sizeX;
    const heightIn = d.sizeY;
    const diagonalIn = Math.sqrt(widthIn * widthIn + heightIn * heightIn);
    return { widthIn, heightIn, diagonalIn };
  }

  // 10) Formatear resolución como string "WIDTHxHEIGHT"
  static formatResolution(width: number, height: number): string {
    return `${width}x${height}`;
  }

  // 11) Encontrar refresh rate disponible más cercano al solicitado
  static findClosestRefreshRate(
    targetHz: number,
    displayIndex = 0
  ): number | null {
    const rates = this.getAvailableRefreshRates(displayIndex);
    if (!rates.length) return null;
    let best = rates[0];
    let bestDiff = Math.abs(best - targetHz);
    for (const r of rates) {
      const d = Math.abs(r - targetHz);
      if (d < bestDiff) {
        bestDiff = d;
        best = r;
      }
    }
    return best;
  }

  // 12) Comprobar si una resolución está soportada por cualquier display
  static isResolutionSupportedOnAnyDisplay(
    width: number,
    height: number
  ): boolean {
    return this.getAllResolutions().some(
      (r) => r.width === width && r.height === height
    );
  }

  // 13) Establecer resolución temporal por una duración (ms) y luego restaurar
  static setTemporaryResolution(
    width: number,
    height: number,
    durationMs: number
  ): number {
    const prev = this.getCurrentResolution();
    this.setResolutionSafe(width, height);
    const id = setTimeout(() => {
      this.setResolutionSafe(prev.width, prev.height);
    }, durationMs);
    // @ts-ignore
    return id;
  }

  // 14) Vigilar cambios de brillo y ejecutar callback (devuelve id)
  static watchBrightnessChange(
    callback: (b: number | null) => void,
    interval = 2000
  ): number {
    let last: number | null = null;
    const id = setInterval(async () => {
      const b = await this.getBrightness();
      if (b !== last) {
        last = b;
        callback(b);
      }
    }, interval);
    // @ts-ignore
    return id;
  }

  // 15) Captura y compara con la última captura (simple diff por bytes) -> devuelve % distinto
  static async captureAndCompareLast(): Promise<{
    diffPercent: number;
  } | null> {
    try {
      const buf: Buffer = await screenshot();
      if (!buf) return null;
      if (!this.lastScreenshotBuffer) {
        this.lastScreenshotBuffer = buf;
        return { diffPercent: 100 };
      }
      const a = this.lastScreenshotBuffer;
      const b = buf;
      const len = Math.min(a.length, b.length);
      let diff = 0;
      for (let i = 0; i < len; i++) if (a[i] !== b[i]) diff++;
      // si tamaños diferentes, contar la diferencia restante
      diff += Math.abs(a.length - b.length);
      const denom = Math.max(a.length, b.length) || 1;
      const percent = (diff / denom) * 100;
      this.lastScreenshotBuffer = buf;
      return { diffPercent: percent };
    } catch (e) {
      return null;
    }
  }

  // 16) Guardar última captura en disco (si existe), o capturar y guardar
  static async saveLastScreenshotTo(path: string): Promise<boolean> {
    const fs = require("fs");
    try {
      if (!this.lastScreenshotBuffer) {
        this.lastScreenshotBuffer = (await screenshot()) as Buffer;
      }
      fs.writeFileSync(path, this.lastScreenshotBuffer);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 17) Listar displays agrupados por tipo de conexión (HDMI/DP/VGA/unknown)
  static async listDisplaysByConnectionType(): Promise<
    { connection: string; displays: any[] }[]
  > {
    const g = await si.graphics();
    const map = new Map<string, any[]>();
    g.displays.forEach((d) => {
      const key =
        d.connection && d.connection !== "" ? d.connection : "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return Array.from(map.entries()).map(([connection, displays]) => ({
      connection,
      displays,
    }));
  }

  static async getDisplayByUUID(displayIndex = 0): Promise<string | null> {
    const g = await si.graphics();
    const d = g.displays[displayIndex] as any;
    if (!d) return null;
    return d.uuid || `${d.model || "display"}-${displayIndex}`;
  }

  // 19) Promedio de PPI entre todos los displays (si se puede calcular)
  static async getAveragePPIAcrossDisplays(): Promise<number | null> {
    const g = await si.graphics();
    const ppis: number[] = [];
    for (const d of g.displays) {
      if (
        typeof d.currentResX === "number" &&
        typeof d.currentResY === "number" &&
        typeof d.sizeX === "number" &&
        typeof d.sizeY === "number"
      ) {
        const diagPx = Math.sqrt(
          d.currentResX * d.currentResX + d.currentResY * d.currentResY
        );
        const diagIn = Math.sqrt(d.sizeX * d.sizeX + d.sizeY * d.sizeY);
        if (diagIn > 0) ppis.push(diagPx / diagIn);
      }
    }
    if (!ppis.length) return null;
    return ppis.reduce((a, b) => a + b, 0) / ppis.length;
  }

  // --- 20 métodos nuevos (no repetidos) ---

  // 1) Listar modelos de monitores (únicos)
  static async listMonitorModels(): Promise<string[]> {
    const g = await si.graphics();
    const models = g.displays.map((d) => (d.model || "unknown").trim());
    return Array.from(new Set(models));
  }

  // 2) Obtener índices válidos de displays [0,1,2,...]
  static async getDisplayIndexes(): Promise<number[]> {
    const g = await si.graphics();
    return g.displays.map((_, i) => i);
  }

  // 3) Buscar índice de display por serial (si existe) - usa cast a any para seriales no tipadas
  static async findDisplayBySerial(serial: string): Promise<number | null> {
    const g = await si.graphics();
    const idx = g.displays.findIndex(
      (d) => ((d as any).serial || "").toString() === serial
    );
    return idx >= 0 ? idx : null;
  }

  // 4) Comprobar si un display es el primario (por índice)
  static async isDisplayPrimary(displayIndex = 0): Promise<boolean> {
    const g = await si.graphics();
    return !!g.displays[displayIndex]?.main;
  }

  // 5) Activar/desactivar Night Light (stub — suele requerir Windows API o utilidades)
  static async toggleNightLight(enable: boolean): Promise<boolean> {
    console.warn(
      "toggleNightLight: implementación completa requiere APIs de Windows. Este método es un stub."
    );
    return false;
  }

  // 6) Programar Night Light entre horas (devuelve id para cancelar)
  static scheduleNightLight(
    onHour: number,
    offHour: number,
    checkIntervalMs = 60000
  ): number {
    const id = setInterval(async () => {
      const h = new Date().getHours();
      const shouldBeOn =
        onHour <= offHour
          ? h >= onHour && h < offHour
          : h >= onHour || h < offHour;
      await this.toggleNightLight(shouldBeOn);
    }, checkIntervalMs);
    // @ts-ignore
    this._nightLightScheduleId = id;
    // @ts-ignore
    return id;
  }

  // 7) Cancelar programación de Night Light (si existiera)
  static cancelNightLightSchedule(id?: number) {
    // @ts-ignore
    const actual = id ?? this._nightLightScheduleId;
    if (actual) clearInterval(actual);
    // @ts-ignore
    this._nightLightScheduleId = null;
  }

  // 8) Obtener modos disponibles que se parezcan al display indicado (heurístico)
  static getDisplayModesForIndex(
    displayIndex = 0
  ): { width: number; height: number; hz: number; color: number }[] {
    const display = (async () =>
      (await si.graphics()).displays[displayIndex])();
    // fallback: devolver todos los modos y dejar que el llamador filtre si quiere
    return this.getAllDisplayModes();
  }

  // 9) Pixel count por display (currentResX * currentResY)
  static async getPixelCountPerDisplay(): Promise<
    { index: number; pixels: number }[]
  > {
    const g = await si.graphics();
    return g.displays.map((d, i) => {
      const w = d.currentResX || 0;
      const h = d.currentResY || 0;
      return { index: i, pixels: w * h };
    });
  }

  // 10) Total de píxeles combinados de todos los displays
  static async getTotalPixelCount(): Promise<number> {
    const arr = await this.getPixelCountPerDisplay();
    return arr.reduce((s, v) => s + v.pixels, 0);
  }

  // 11) Comprobar si un display soporta entrada táctil (si la info está disponible)
  static async isTouchEnabled(displayIndex = 0): Promise<boolean | null> {
    const g = await si.graphics();
    const d = g.displays[displayIndex] as any;
    if (d == null) return null;
    if (typeof d.touch === "boolean") return d.touch;
    return null; // desconocido si no viene en la data
  }

  // 12) Apagar monitor (usa nircmd si está disponible; fallback: stub)
  static async turnOffDisplay(): Promise<boolean> {
    return new Promise((resolve) => {
      exec("nircmd.exe monitor off", (err) => {
        if (err) {
          console.warn(
            "turnOffDisplay: nircmd no disponible o falló. Requiere herramienta externa."
          );
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  // 13) "Despertar" monitor moviendo el mouse (usa nircmd si está disponible)
  static async wakeDisplay(): Promise<boolean> {
    return new Promise((resolve) => {
      exec("nircmd.exe sendmouse move 1 0", (err) => {
        if (err) {
          console.warn(
            "wakeDisplay: nircmd no disponible o falló. Requiere herramienta externa."
          );
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  // 14) Establecer estado de energía del display (on = true, off = false) — wrapper
  static async setDisplayPower(on: boolean): Promise<boolean> {
    if (on) return this.wakeDisplay();
    return this.turnOffDisplay();
  }

  // 15) Rango de refresh rates soportados por display (min/max)
  static getMonitorRefreshCapability(
    displayIndex = 0
  ): { minHz: number; maxHz: number } | null {
    const rates = this.getAvailableRefreshRates(displayIndex);
    if (!rates.length) return null;
    return { minHz: Math.min(...rates), maxHz: Math.max(...rates) };
  }

  // 16) Buscar mejor modo por aspect ratio (p. ej. "16:9")
  static findBestModeForAspectRatio(
    aspect: string
  ): { width: number; height: number; hz: number; color: number } | null {
    const [aw, ah] = aspect.split(":").map((s) => parseFloat(s));
    if (!aw || !ah) return null;
    const targetRatio = aw / ah;
    const modes = this.getAllDisplayModes();
    if (!modes.length) return null;
    let best: any = null;
    let bestDiff = Infinity;
    for (const m of modes) {
      const r = m.width / m.height;
      const diff = Math.abs(r - targetRatio);
      const score = diff * 100000 - (m.width * m.height) / 1000 - m.hz; // prefer close ratio y alta resolución/Hz
      if (score < bestDiff) {
        bestDiff = score;
        best = m;
      }
    }
    return best || null;
  }

  // 17) Resumen human-readable (string) de displays
  static async formatDisplayInfoHumanReadable(): Promise<string> {
    const info = await this.getDisplayInfo();
    return info
      .map((d, i) => {
        return `Display ${i}: ${d.model || "unknown"} — ${d.resolution} @ ${
          d.refreshRate || "?"
        }Hz — main:${!!d.main} — depth:${d.pixelDepth || "?"}`;
      })
      .join("\n");
  }

  // 18) Comparar displays por PPI (lista ordenada descendente)
  static async compareDisplaysByPPI(): Promise<
    { index: number; ppi: number }[] | null
  > {
    const g = await si.graphics();
    const ppis: { index: number; ppi: number }[] = [];
    for (let i = 0; i < g.displays.length; i++) {
      const d: any = g.displays[i];
      if (
        typeof d.currentResX === "number" &&
        typeof d.currentResY === "number" &&
        typeof d.sizeX === "number" &&
        typeof d.sizeY === "number"
      ) {
        const diagPx = Math.sqrt(
          d.currentResX * d.currentResX + d.currentResY * d.currentResY
        );
        const diagIn = Math.sqrt(d.sizeX * d.sizeX + d.sizeY * d.sizeY);
        if (diagIn > 0) ppis.push({ index: i, ppi: diagPx / diagIn });
      }
    }
    if (!ppis.length) return null;
    return ppis.sort((a, b) => b.ppi - a.ppi);
  }

  // 19) Mayor intervalo (segundos) entre cambios de resolución en el historial
  static getLongestUptimeSinceResolutionChange(): number {
    if (this.resolutionHistory.length < 2) return 0;
    let best = 0;
    for (let i = 1; i < this.resolutionHistory.length; i++) {
      const diffSec =
        (this.resolutionHistory[i].timestamp -
          this.resolutionHistory[i - 1].timestamp) /
        1000;
      if (diffSec > best) best = diffSec;
    }
    return best;
  }

  // 20) Snapshot de la configuración actual (guarda a file con timestamp) y devuelve ruta
  static async snapshotConfigs(saveFolder = "./"): Promise<string | null> {
    const fs = require("fs");
    try {
      const config = {
        timestamp: Date.now(),
        resolution: this.getCurrentResolution(),
        mode: this.getCurrentDisplayMode(),
        displays: await this.getDisplayInfo(),
      };
      const name = `display_snapshot_${Date.now()}.json`;
      const path = require("path").join(saveFolder, name);
      fs.writeFileSync(path, JSON.stringify(config, null, 2));
      return path;
    } catch (e) {
      console.error("snapshotConfigs error:", e);
      return null;
    }
  }

  // 20) Listar drivers de monitor instalados (intento con pnputil; puede fallar si no existe)
  static async listInstalledMonitorDrivers(): Promise<string[]> {
    return new Promise((resolve) => {
      exec(`pnputil /enum-drivers`, (err, stdout) => {
        if (err) {
          console.warn(
            "listInstalledMonitorDrivers: pnputil no disponible o error."
          );
          return resolve([]);
        }
        const blocks = stdout
          .split(/\r?\n\r?\n/)
          .map((b) => b.trim())
          .filter(Boolean);
        // extraer nombres de driver (heurístico)
        const names = blocks.map((b) => {
          const m = b.match(/Published Name : (.+)/i);
          return m ? m[1].trim() : b.split(/\r?\n/)[0];
        });
        resolve(names);
      });
    });
  }

  static watchResolutionChangeWithHistory(interval = 1000) {
    let lastRes = this.getCurrentResolution();
    this.resolutionHistory.push({ ...lastRes, timestamp: Date.now() });
    setInterval(() => {
      const currentRes = this.getCurrentResolution();
      if (
        currentRes.width !== lastRes.width ||
        currentRes.height !== lastRes.height
      ) {
        lastRes = currentRes;
        this.resolutionHistory.push({ ...currentRes, timestamp: Date.now() });
      }
    }, interval);
  }

  static getResolutionHistory(): {
    width: number;
    height: number;
    timestamp: number;
  }[] {
    return this.resolutionHistory;
  }

  static async isHDRSupported(): Promise<boolean> {
    return new Promise((resolve) => {
      const psCommand = `$hdr=$false;Get-ChildItem 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers\\Configuration' | ForEach-Object { $props=Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue; if($props -ne $null){ if($props.PSObject.Properties.Name -contains 'PrimSurfSize.cx'){$hdr=$true}}}; if($hdr){Write-Host 'true'}else{Write-Host 'false'}`;

      exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
        if (error) {
          resolve(false);
          return;
        }

        resolve(stdout.trim().toLowerCase() === "true");
      });
    });
  }

  static getAverageRefreshRate(): number {
    const modes = this.getAllDisplayModes();
    if (!modes.length) return 0;
    const totalHz = modes.reduce((sum, m) => sum + m.hz, 0);
    return totalHz / modes.length;
  }

  static getResolutionChangeRate(): number {
    if (this.resolutionHistory.length < 2) return 0;
    const totalChanges = this.resolutionHistory.length - 1;
    const timeSpan =
      (this.resolutionHistory[this.resolutionHistory.length - 1].timestamp -
        this.resolutionHistory[0].timestamp) /
      1000;
    return totalChanges / timeSpan;
  }

  static compareRefreshRates(
    modeA: { hz: number },
    modeB: { hz: number }
  ): "A" | "B" | "Equal" {
    if (modeA.hz > modeB.hz) return "A";
    if (modeB.hz > modeA.hz) return "B";
    return "Equal";
  }

  static async getPPI(): Promise<number | null> {
    const displays = await si.graphics();
    const display = displays.displays[0];

    // Verificar que existan todos los valores necesarios y sean números
    if (
      !display ||
      typeof display.sizeX !== "number" ||
      typeof display.sizeY !== "number" ||
      typeof display.currentResX !== "number" ||
      typeof display.currentResY !== "number"
    ) {
      return null;
    }

    const diagonalPixels = Math.sqrt(
      Math.pow(display.currentResX, 2) + Math.pow(display.currentResY, 2)
    );

    const diagonalInches = Math.sqrt(
      Math.pow(display.sizeX, 2) + Math.pow(display.sizeY, 2)
    );

    return diagonalPixels / diagonalInches;
  }

  static setResolution(width: number, height: number) {
    exec(
      `powershell -Command "Get-DisplayResolution | Format-List"`,
      (error, stdout, stderr) => {
        if (error) {
          return;
        }

        const matchWidth = stdout.match(/dmPelsWidth\s*:\s*(\d+)/);
        const matchHeight = stdout.match(/dmPelsHeight\s*:\s*(\d+)/);

        if (!matchWidth || !matchHeight) {
          return;
        }

        exec(
          `powershell -Command "Set-DisplayResolution -Width ${width} -Height ${height} -Force"`,
          (error) => {}
        );
      }
    );
  }

  static autoResolutionByTime(
    dayRes: { w: number; h: number },
    nightRes: { w: number; h: number }
  ) {
    setInterval(() => {
      const hour = new Date().getHours();
      if (hour >= 20 || hour < 6) {
        this.setResolutionSafe(nightRes.w, nightRes.h);
      } else {
        this.setResolutionSafe(dayRes.w, dayRes.h);
      }
    }, 60000);
  }

  static async getPrimaryDisplay() {
    const displays = await si.graphics();
    return displays.displays.find((d) => d.main) || null;
  }

  static async getMultiMonitorInfo() {
    const displays = await si.graphics();
    return displays.displays.map((d) => ({
      model: d.model,
      resolution: `${d.currentResX}x${d.currentResY}`,
      refreshRate: d.currentRefreshRate,
      isMain: d.main,
    }));
  }

  static exportResolutionHistoryCSV(path: string) {
    const fs = require("fs");
    const csv = this.resolutionHistory
      .map((r) => `${r.timestamp},${r.width},${r.height}`)
      .join("\n");
    fs.writeFileSync(path, "timestamp,width,height\n" + csv);
  }

  static resetDisplaySettings() {
    exec(`powershell -Command "DisplayReset"`, (err) => {
      if (err) console.error("Error resetting display:", err);
    });
  }

  static autoResolutionByBrightness(
    dayRes: { w: number; h: number },
    nightRes: { w: number; h: number }
  ) {
    setInterval(async () => {
      const brightness = await Screen.getBrightness();
      if (brightness !== null && brightness < 30) {
        Screen.setResolutionSafe(nightRes.w, nightRes.h);
      } else if (brightness !== null) {
        Screen.setResolutionSafe(dayRes.w, dayRes.h);
      }
    }, 10000);
  }

  static async getEDID(displayIndex = 0): Promise<string | null> {
    return new Promise((resolve) => {
      exec(
        `powershell -Command "Get-CimInstance -Namespace root\\wmi -ClassName WmiMonitorID | Select-Object -ExpandProperty UserFriendlyName"`,
        (err, stdout) => {
          if (err) return resolve(null);
          const lines = stdout
            .trim()
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
          resolve(lines[displayIndex] ?? null);
        }
      );
    });
  }

  // 2) Tipo de conector (HDMI/DP/VGA) - fallback con si.graphics()
  static async getConnectorType(displayIndex = 0): Promise<string | null> {
    const g = await si.graphics();
    const d = g.displays[displayIndex];
    return (d && d.connection) ?? null;
  }

  // 3) Listar perfiles de color instalados (sRGB, AdobeRGB, etc.)
  static async listColorProfiles(): Promise<string[]> {
    return new Promise((resolve) => {
      exec(
        `powershell -Command "Get-ChildItem 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ICM' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty PSChildName"`,
        (err, stdout) => {
          if (err) return resolve([]);
          resolve(
            stdout
              .trim()
              .split(/\r?\n/)
              .map((l) => l.trim())
              .filter(Boolean)
          );
        }
      );
    });
  }

  // 4) Aplicar perfil de color (requiere herramienta externa o API)
  static async applyColorProfile(profileName: string): Promise<boolean> {
    // Stub: cambiar perfil de color requiere utilidades (DisplayCAL, Windows API).
    // Aquí solo guardamos la intención.
    console.warn(
      "applyColorProfile: requiere implementación con herramientas nativas."
    );
    return false;
  }

  // 5) Iniciar calibración de color (stub que lanza external tool)
  static async calibrateColor(): Promise<boolean> {
    console.warn(
      "calibrateColor: implementa con DisplayCAL o API de fabricante."
    );
    return false;
  }

  // 6) Programar cambio de resolución a una hora (devuelve id para cancelar)
  static scheduleResolutionChange(
    width: number,
    height: number,
    runAt: Date
  ): number {
    const ms = runAt.getTime() - Date.now();
    const id = setTimeout(
      () => this.setResolutionWithFallback(width, height),
      Math.max(0, ms)
    );
    // @ts-ignore
    return id;
  }

  // 7) Cancelar programación por id
  static cancelScheduledChange(id: number) {
    clearTimeout(id);
  }

  // 8) Obtener factor de escala (DPI scaling) de Windows
  static async getScaling(): Promise<number | null> {
    return new Promise((resolve) => {
      exec(
        `powershell -Command "[System.Windows.SystemParameters]::PrimaryScreenWidth; [System.Windows.SystemParameters]::PrimaryScreenHeight"`,
        (err, stdout) => {
          if (err) return resolve(null);
          // No es directo; devolver null como fallback
          resolve(null);
        }
      );
    });
  }

  // 9) Establecer factor de escala (nota: requiere reinicio / logoff)
  static async setScaling(scalePercent: number): Promise<boolean> {
    console.warn(
      "setScaling: cambiar DPI desde código requiere edición del registro y relogin. Implementación no trivial."
    );
    return false;
  }

  // 10) Hacer mirror (clonar) todos los monitores en modo espejo
  static async cloneDisplays(): Promise<boolean> {
    // Requiere llamadas a API nativas o DisplaySwitch.exe
    exec(`powershell -Command "DisplaySwitch.exe /clone"`, (err) => {});
    return true;
  }

  // 11) Extender escritorio a monitor específico (extend)
  static async extendToDisplay(displayIndex = 1): Promise<boolean> {
    // Invocar DisplaySwitch no permite elegir índice; es un stub
    exec(`powershell -Command "DisplaySwitch.exe /extend"`, (err) => {});
    return true;
  }

  // 12) Mover una ventana (por handle) a otro display (stub)
  static moveWindowToDisplay(
    windowHandle: number,
    displayIndex: number
  ): boolean {
    console.warn(
      "moveWindowToDisplay: requiere bindings a Win32 (SetWindowPos / MonitorFromWindow)."
    );
    return false;
  }

  // 13) Obtener lista de refresh rates disponibles para un display
  static getAvailableRefreshRates(displayIndex = 0): number[] {
    const modes = this.getAllDisplayModes().filter((m, i) => true);
    const rates = Array.from(new Set(modes.map((m) => m.hz))).sort(
      (a, b) => a - b
    );
    return rates;
  }

  // 14) Ajustar gamma (simple wrapper, necesita herramienta externa)
  static setGamma(r: number, g: number, b: number) {
    console.warn(
      "setGamma: implementar con API nativa (SetDeviceGammaRamp) o tool externa."
    );
  }

  // 15) Obtener gamma actual (stub)
  static getGamma(): { r: number; g: number; b: number } | null {
    console.warn("getGamma: requiere API nativa.");
    return null;
  }

  // 16) Habilitar Adaptive Sync (G-Sync/FreeSync) (stub)
  static async enableAdaptiveSync(): Promise<boolean> {
    console.warn(
      "enableAdaptiveSync: normalmente se controla por driver (NVIDIA/AMD)."
    );
    return false;
  }

  // 17) Deshabilitar Adaptive Sync (stub)
  static async disableAdaptiveSync(): Promise<boolean> {
    console.warn(
      "disableAdaptiveSync: normalmente se controla por driver (NVIDIA/AMD)."
    );
    return false;
  }

  // 18) Forzar monitor primario (setPrimaryDisplay)
  static async setPrimaryDisplay(displayIndex = 0): Promise<boolean> {
    // Requiere llamadas nativas (ChangeDisplaySettingsEx)
    console.warn(
      "setPrimaryDisplay: requiere API nativa ChangeDisplaySettingsEx."
    );
    return false;
  }

  // 19) Ver estado del cable (si está conectado/detected) - stub con si.graphics fallback
  static async getCableStatus(
    displayIndex = 0
  ): Promise<"connected" | "disconnected" | "unknown"> {
    const g = await si.graphics();
    const d = g.displays[displayIndex];
    if (!d) return "unknown";

    if (d.connection && d.connection !== "") {
      return "connected";
    } else {
      return "disconnected";
    }
  }

  static async rescanDisplays(): Promise<boolean> {
    console.warn(
      "rescanDisplays: implementar con devcon o reiniciando el driver."
    );
    return false;
  }

  static async setBrightness(value: number) {
    exec(
      `powershell -Command "(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, ${value})"`,
      (err) => {}
    );
  }

  static rotateNext() {
    const rotations = [0, 90, 180, 270];
    const current = this.rotationHistory.length
      ? this.rotationHistory[this.rotationHistory.length - 1].degrees
      : 0;
    const nextIndex = (rotations.indexOf(current) + 1) % rotations.length;
    this.rotateDisplay(rotations[nextIndex]);
  }

  static async exportDisplayInfo(path: string) {
    const info = await this.getDisplayInfo();
    const fs = require("fs");
    fs.writeFileSync(path, JSON.stringify(info, null, 2));
  }

  static watchMonitorChanges(
    callback: (count: number) => void,
    interval = 2000
  ) {
    let lastCount = 0;
    setInterval(async () => {
      const count = await this.getNumberOfDisplays();
      if (count !== lastCount) {
        callback(count);
        lastCount = count;
      }
    }, interval);
  }

  static async getBrightness(): Promise<number | null> {
    return new Promise((resolve) => {
      exec(
        `powershell -Command "(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightness).CurrentBrightness"`,
        (err, stdout) => {
          if (err) return resolve(null);
          resolve(parseInt(stdout.trim()));
        }
      );
    });
  }

  static async saveCurrentConfig(path: string) {
    const config = {
      resolution: this.getCurrentResolution(),
      refreshRate: this.getCurrentDisplayMode().hz,
      orientation: this.getCurrentOrientation(),
      timestamp: Date.now(),
    };
    const fs = require("fs");
    fs.writeFileSync(path, JSON.stringify(config, null, 2));
  }

  static async restoreConfig(path: string) {
    const fs = require("fs");
    if (!fs.existsSync(path)) return;
    const config = JSON.parse(fs.readFileSync(path, "utf8"));
    this.setResolutionSafe(config.resolution.width, config.resolution.height);
    this.setRefreshRate(config.refreshRate);
  }

  static isCurrentResolutionOptimal(): boolean {
    const best = this.getBestResolution();
    const current = this.getCurrentResolution();
    return best?.width === current.width && best?.height === current.height;
  }

  static watchDisplayChanges(callback: () => void, interval = 1000) {
    let lastRes = this.getCurrentResolution();
    let lastOrientation = this.getCurrentOrientation();
    setInterval(() => {
      if (
        this.hasResolutionChanged(lastRes) ||
        lastOrientation !== this.getCurrentOrientation()
      ) {
        callback();
        lastRes = this.getCurrentResolution();
        lastOrientation = this.getCurrentOrientation();
      }
    }, interval);
  }

  static compareAllResolutions() {
    const resolutions = this.getAllResolutions();
    return resolutions.sort((a, b) => b.width * b.height - a.width * a.height);
  }

  static setRefreshRate(hz: number) {
    exec(`powershell -Command "Set-DisplayRefreshRate -Hz ${hz}"`, (err) => {});
  }

  static exportResolutionHistory(path: string) {
    const fs = require("fs");
    fs.writeFileSync(path, JSON.stringify(this.resolutionHistory, null, 2));
  }

  static setResolutionSafe(width: number, height: number) {
    if (!this.supportsResolution(width, height)) {
      return;
    }
    this.setResolution(width, height);
  }

  static setResolutionWithFallback(width: number, height: number) {
    if (this.supportsResolution(width, height)) {
      this.setResolution(width, height);
    } else {
      const best = this.getBestResolution();
      if (best) this.setResolution(best.width, best.height);
    }
  }

  static async getDisplaySummary() {
    const info = await this.getDisplayInfo();
    return info.map((d) => ({
      model: d.model,
      resolution: d.resolution,
      refreshRate: d.refreshRate,
      pixelDepth: d.pixelDepth,
    }));
  }

  static watchRotationChange(degrees: number) {
    this.rotationHistory.push({ degrees, timestamp: Date.now() });
    this.rotateDisplay(degrees);
  }
  static getRotationHistory() {
    return this.rotationHistory;
  }

  static restoreInitialResolution() {
    if (this.resolutionHistory.length > 0) {
      const { width, height } = this.resolutionHistory[0];
      this.setResolutionSafe(width, height);
    }
  }

  static rotateDisplay(degrees: number) {
    const allowed = [0, 90, 180, 270];
    if (!allowed.includes(degrees)) {
      return;
    }
    exec(`powershell -Command "DisplayRotation ${degrees}"`, (err) => {});
  }

  static getSupportedOrientations(): string[] {
    const resolutions = this.getAllResolutions();
    const orientations = new Set<string>();
    resolutions.forEach((r) => {
      orientations.add(r.width >= r.height ? "landscape" : "portrait");
    });
    return Array.from(orientations);
  }

  static getCurrentOrientation(): string {
    const res = this.getCurrentResolution();
    return res.width >= res.height ? "landscape" : "portrait";
  }

  static async getNumberOfDisplays(): Promise<number> {
    const displays = await si.graphics();
    return displays.displays.length;
  }

  static compareResolutions(
    resA: { width: number; height: number },
    resB: { width: number; height: number }
  ): "A" | "B" | "Equal" {
    const pixelsA = resA.width * resA.height;
    const pixelsB = resB.width * resB.height;
    if (pixelsA > pixelsB) return "A";
    if (pixelsB > pixelsA) return "B";
    return "Equal";
  }

  static async getColorDepth(): Promise<number | null> {
    const displays = await si.graphics();
    return displays.displays[0]?.pixelDepth || null;
  }

  static async captureScreenshot(
    path: string = "screenshot.jpg"
  ): Promise<void> {
    await screenshot({ filename: path });
  }

  static watchResolutionChange(
    callback: (res: { width: number; height: number }) => void,
    interval = 1000
  ) {
    let lastRes = this.getCurrentResolution();
    setInterval(() => {
      const currentRes = this.getCurrentResolution();
      if (
        currentRes.width !== lastRes.width ||
        currentRes.height !== lastRes.height
      ) {
        lastRes = currentRes;
        callback(currentRes);
      }
    }, interval);
  }

  static async getDisplayInfo(): Promise<any[]> {
    const displays = await si.graphics();
    return displays.displays.map((d) => ({
      model: d.model,
      main: d.main,
      resolution: `${d.currentResX}x${d.currentResY}`,
      refreshRate: d.currentRefreshRate,
      pixelDepth: d.pixelDepth,
    }));
  }

  static isHighRefreshRate(): boolean {
    const mode = this.getCurrentDisplayMode();
    return mode.hz >= 120;
  }

  static getAspectRatio(): string {
    const res = this.getCurrentResolution();
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(res.width, res.height);
    return `${res.width / divisor}:${res.height / divisor}`;
  }

  static supportsResolution(width: number, height: number): boolean {
    return this.getAllResolutions().some(
      (r) => r.width === width && r.height === height
    );
  }

  static getBestDisplayMode(): {
    width: number;
    height: number;
    hz: number;
    color: number;
  } | null {
    const modes = this.getAllDisplayModes();
    if (!modes.length) return null;
    return modes.sort(
      (a, b) =>
        b.width - a.width ||
        b.height - a.height ||
        b.hz - a.hz ||
        b.color - a.color
    )[0];
  }

  static hasResolutionChanged(last: {
    width: number;
    height: number;
  }): boolean {
    const current = this.getCurrentResolution();
    return current.width !== last.width || current.height !== last.height;
  }

  static hasDisplayModeChanged(last: {
    width: number;
    height: number;
    hz: number;
    color: number;
  }): boolean {
    const current = this.getCurrentDisplayMode();
    return (
      current.width !== last.width ||
      current.height !== last.height ||
      current.hz !== last.hz ||
      current.color !== last.color
    );
  }

  static getBestResolution(): { width: number; height: number } | null {
    const all = this.getAllResolutions();
    if (!all.length) return null;
    return all.sort((a, b) =>
      b.width - a.width === 0 ? b.height - a.height : b.width - a.width
    )[0];
  }

  static getCurrentResolution(): { width: number; height: number } {
    return getCurrentResolution();
  }

  static getAllResolutions(): { width: number; height: number }[] {
    return getAvailableResolution();
  }

  static getCurrentDisplayMode(): {
    width: number;
    height: number;
    hz: number;
    color: number;
  } {
    return getCurrentDisplayMode();
  }

  static getAllDisplayModes(): {
    width: number;
    height: number;
    hz: number;
    color: number;
  }[] {
    return getAvailableDisplayMode();
  }
}
