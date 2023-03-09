export const noteNameBase = {
  major: [
    'C', 'Db', 'D', 'Eb', 'E', 'F',
    'F#', 'G', 'Ab', 'A', 'Bb', 'B',
  ],
  minor: [
    'C', 'Db', 'D', 'Eb', 'E', 'F',
    'F#', 'G', 'Ab', 'A', 'Bb', 'B',
  ],
};
export const noteNameDB = Object.fromEntries(Object.entries(noteNameBase).map(([key, arr]) => [
  key,
  new Proxy(arr, {
    get(db, key) {
      if (typeof key === 'symbol') return undefined;
      const idx = parseInt(key);
      const o = db[idx%12];
      return o+Math.floor(idx/12);
    },
  }),
])) as typeof noteNameBase;
export const chordNote = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
};
