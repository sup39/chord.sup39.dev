import {AnswerChecker, SimpleCheckerFactory} from '%/answer';
import {noteNameBase, noteNameDB} from '%/note';

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

const invDB = {
  major: [0, 4, 7, 12, 16],
  minor: [0, 3, 7, 12, 15],
};
const invNames = ['基本形', '第一転回形', '第二転回形'];
export function makeQGChordFixedInv() {
  let index = 0;
  let ctype: keyof typeof invDB = 'major';
  let base = 0;
  return function QGChordFixedInv(): Question {
    if (index === 0) {
      ctype = Math.random() < 0.5 ? 'major' : 'minor';
      base = Math.random()*12|0;
    }
    const solution = invDB[ctype].slice(index, index+3).map(off => base+off);
    const sbase = noteNameDB[ctype][base][base] + (ctype === 'major' ? '' : 'm');
    const q = {
      prompt: `${sbase} (${invNames[index]})`,
      check: SimpleCheckerFactory(solution[0], solution.slice(1).map(x => x-solution[0])),
      solution,
    };
    // next
    index = (index+1)%3;
    return q;
  };
}

export function makeQGChordRandomInv(type: 'order'|'root'|'highest') {
  return function QGChordFixedInv(): Question {
    const ctype = Math.random() < 0.5 ? 'major' : 'minor';
    const base = Math.random()*12|0;
    const iinv = Math.random()*3|0;
    const solution = invDB[ctype].slice(iinv, iinv+3).map(off => base+off);
    const db = noteNameDB[ctype][base];
    const sbase = db[base] + (ctype === 'major' ? '' : 'm');
    const prompt =
      type === 'order' ? `${sbase} (${invNames[iinv]})` :
        type === 'root' ? iinv === 0 ? sbase : `${sbase}/${db[solution[0]]}` :
          `${sbase} (最高音: ${db[solution[2]]})`;
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
