import {AnswerChecker, SimpleCheckerFactory} from '%/answer';
import {noteNameBase, noteNameDB, chordNotes, chordTypes, chordSuffix, invNames} from '%/note';

export type Question = {
  prompt: string
  check: AnswerChecker
  solution: number[]
};

export function makeQGSingleNote() {
  return function OGSingleNote(): Question {
    const ndb = noteNameBase[Math.random() < 0.5 ? 'sharp' : 'flat'];
    const base = Math.random()*12|0;
    return {
      prompt: ndb[base],
      check: SimpleCheckerFactory(base, []),
      solution: [base],
    };
  };
}

export function makeQGOctave() {
  return function QGOctave(): Question {
    const ndb = noteNameBase[Math.random() < 0.5 ? 'sharp' : 'flat'];
    const base = Math.random()*12|0;
    return {
      prompt: ndb[base],
      check: SimpleCheckerFactory(base, [12]),
      solution: [base, base+12],
    };
  };
}

export function makeQGChordFixedInv() {
  let iinv = 0;
  let ctype: 'major' | 'minor' = 'major';
  let base = 0;
  return function QGChordFixedInv(): Question {
    if (iinv === 0) {
      ctype = Math.random() < 0.5 ? 'major' : 'minor';
      base = Math.random()*12|0;
    }
    const solution = chordNotes[ctype][iinv].map(off => base+off);
    const ndb = noteNameDB[ctype];
    const sbase = ndb[base][base] + chordSuffix[ctype];
    const q = {
      prompt: `${sbase} (${invNames[iinv]})`,
      check: SimpleCheckerFactory(solution[0], solution.slice(1).map(x => x-solution[0])),
      solution,
    };
    // next
    iinv = (iinv+1)%3;
    return q;
  };
}

export const randomElement = <T>(db: readonly T[]) => db[Math.random()*db.length|0];
export type ChordQuestion = {
  ctype: keyof typeof chordNotes
  base: number
  iinv: number
};
export const defaultQFChordRandomInv = () => {
  const ctype = randomElement(['major', 'minor'] as const);
  const base = Math.random()*12|0;
  const iinv = Math.random()*chordNotes[ctype].length|0;
  return {ctype, base, iinv};
};
export const cinvDB = chordTypes.flatMap(ctype => chordNotes[ctype].map((_, iinv) => ({ctype, iinv})));
export const makeIndepQFChordRandomInv = ({base, cinv}: {
  cinv?: {ctype: ChordQuestion['ctype'], iinv: number}[]
  base?: number[]
}) => {
  const gBase = base == null || base.length === 0 ? (()=>Math.random()*12|0) : (()=>randomElement(base));
  const cinvPool = cinv == null || cinv.length === 0 ? cinvDB : cinv;
  const gCinv = () => randomElement(cinvPool);
  return function indepQFChordRandomInv() {
    return {
      base: gBase(),
      ...gCinv(),
    };
  };
};
export function makeQGChordRandomInv(type: 'order'|'root'|'highest', questionFactory: ()=>ChordQuestion) {
  return function QGChordFixedInv(): Question {
    const {ctype, base, iinv} = questionFactory();
    const ndb = noteNameDB[ctype === 'power' ? Math.random()<0.5 ? 'major' : 'minor' : ctype][base];
    const solution = chordNotes[ctype][iinv].map(off => base+off);
    const sbase = ndb[base] + chordSuffix[ctype];
    const prompt =
      type === 'order' ? `${sbase} (${invNames[iinv]})` :
        type === 'root' ? iinv === 0 ? sbase : `${sbase}/${ndb[solution[0]]}` :
          `${sbase} (最高音: ${ndb[solution[solution.length-1]]})`;
    return {
      prompt,
      check: SimpleCheckerFactory(solution[0], solution.slice(1).map(x => x-solution[0])),
      solution,
    };
  };
}

export const questionDummy: Question = {
  prompt: '',
  check: () => null,
  solution: [],
};

export const qtypes = [
  {value: 'order', label: '和音記号 (第X転回形)'},
  {value: 'root', label: '和音記号/ルート'},
  {value: 'highest', label: '和音記号 (最高音)'},
] as const;
export type QType = (typeof qtypes)[number]['value'];
