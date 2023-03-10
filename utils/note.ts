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

const makeInvDB = (notes: number[]) =>
  notes.map((_, iinv) => notes.map((n, i, a) => a[(i+iinv)%a.length]+((i+iinv)>=a.length ? 12 : 0)));
export const chordNotes = {
  power: makeInvDB([0, 7]),
  major: makeInvDB([0, 4, 7]),
  minor: makeInvDB([0, 3, 7]),
};
export const chordTypes = Object.keys(chordNotes) as (keyof typeof chordNotes)[];
export const chordSuffix = {
  power: '5',
  major: '',
  minor: 'm',
};
export const invNames = ['基本形', '第一転回形', '第二転回形'];
