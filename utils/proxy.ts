export const makeLoopProxyHandler = <T>(ord: number) => ({
  get(db, key) {
    if (typeof key === 'string') {
      const idx = parseInt(key);
      const o = db[(idx%ord+ord)%ord];
      if (o != null) return o;
    }
    return db[key as any];
  },
} as ProxyHandler<T[]>);
