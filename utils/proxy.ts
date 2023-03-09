export const makeLoopProxyHandler = <T>(ord: number) => ({
  get(db, key) {
    if (typeof key === 'symbol') return undefined;
    const idx = parseInt(key);
    const o = db[(idx%ord+ord)%ord];
    return o;
  },
} as ProxyHandler<T[]>);
