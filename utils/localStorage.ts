export function tryParseJSON(o: any): any {
  try {
    return JSON.parse(o);
  } catch {
    return undefined;
  }
}

export function getConfig<T extends Record<string, any>>(lskey: string, defaultConfig: T): T {
  if (typeof localStorage === 'undefined') return defaultConfig;
  const o = tryParseJSON(localStorage.getItem(lskey));
  if (o == null || typeof o !== 'object') return defaultConfig;
  return Object.fromEntries(Object.entries(defaultConfig).map(([k, v0]) => [k, o[k] ?? v0])) as T;
}
