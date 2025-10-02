import * as regedit from "regedit";

type RegType =
  | "REG_SZ"
  | "REG_DWORD"
  | "REG_BINARY"
  | "REG_EXPAND_SZ"
  | "REG_MULTI_SZ";

export default class Regedit {
  static createKey(hiveAndKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      regedit.createKey([hiveAndKey], (err) => {
        if (err) return reject(err);
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Clave creada en: ${hiveAndKey}`);
        resolve();
      });
    });
  }

  static deleteKey(hiveAndKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      regedit.deleteKey([hiveAndKey], (err) => {
        if (err) return reject(err);
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Clave eliminada: ${hiveAndKey}`);
        resolve();
      });
    });
  }

  static setValue(
    hiveAndKey: string,
    valueName: string,
    type: RegType,
    value: string | number | string[]
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const mapping = {
        [hiveAndKey]: {
          [valueName]: { value, type },
        },
      };

      regedit.putValue(mapping, (err) => {
        if (err) return reject(err);
        console.log(
          `\x1b[32m[SUCCESS]\x1b[0m Valor ${valueName} escrito en ${hiveAndKey}`
        );
        resolve();
      });
    });
  }

  static deleteValue(hiveAndKey: string, valueName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      regedit.deleteValue({ [hiveAndKey]: [valueName] }, (err) => {
        if (err) return reject(err);
        console.log(
          `\x1b[32m[SUCCESS]\x1b[0m Valor ${valueName} eliminado en ${hiveAndKey}`
        );
        resolve();
      });
    });
  }

  static listKey(hiveAndKey: string | string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      regedit.list(hiveAndKey, (err, result) => {
        if (err) return reject(err);
        console.log(`\x1b[32m[SUCCESS]\x1b[0m Listado de claves completado`);
        resolve(result);
      });
    });
  }

  static getArch(): string {
    return regedit.arch["64"];
  }
}
