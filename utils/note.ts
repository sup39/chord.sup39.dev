import {makeLoopProxyHandler} from '%/proxy';

const _noteNameBase = {
  sharp: [
    'C', 'C#', 'D', 'D#', 'E', 'F',
    'F#', 'G', 'G#', 'A', 'A#', 'B',
  ],
  flat: [
    'C', 'Db', 'D', 'Eb', 'E', 'F',
    'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
  ],
};

export const noteNameBase = Object.fromEntries(Object.entries(_noteNameBase).map(([key, arr]) => [
  key, new Proxy(arr, makeLoopProxyHandler(12)),
])) as typeof _noteNameBase;

export const sharpCountBase = Array.from({length: 12}, (_, i) => i*7%12);
export const noteNameDB = {
  major: sharpCountBase.map(x => noteNameBase[x <= 6 ? 'sharp' : 'flat']),
  dominant: sharpCountBase.map(x => noteNameBase[(x+11)%12 <= 6 ? 'sharp' : 'flat']), // -1
  minor: sharpCountBase.map(x => noteNameBase[(x+10)%12 <= 6 ? 'sharp' : 'flat']), // -2
};

export const chordNote = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
};
