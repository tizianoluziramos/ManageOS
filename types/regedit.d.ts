declare module "regedit" {
  type Callback<T = any> = (err: Error | null, result?: T) => void;
  export function list(keys: string | string[], cb: Callback): void;
  export function putValue(mapping: any, cb: Callback): void;
  export function createKey(keys: string | string[], cb: Callback): void;
  export function deleteKey(keys: string | string[], cb: Callback): void;
  export function deleteValue(mapping: any, cb: Callback): void;
  export const arch: { "32": string; "64": string };
}
