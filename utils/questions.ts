import {AnswerChecker, SimpleCheckerFactory} from '%/answer';
import {noteNameBase} from '%/note';

export type Question = {
  prompt: string
  check: AnswerChecker
  solution: number[]
};

export function makeQGSingleNote() {
  return function OGSingleNote(): Question {
    const ndb = noteNameBase[Math.random() < 0.5 ? 'major' : 'minor'];
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
    const ndb = noteNameBase[Math.random() < 0.5 ? 'major' : 'minor'];
    const base = Math.random()*12|0;
    return {
      prompt: ndb[base],
      check: SimpleCheckerFactory(base, [12]),
      solution: [base, base+12],
    };
  };
}

export function makeQGSimpleChord() {
  const solutionDB = {
    major: [0, 4, 7, 12, 16],
    minor: [0, 3, 7, 12, 15],
  };
  const invNames = ['基本形', '第一転回形', '第二転回形'];
  let index = 0;
  let ctype: keyof typeof solutionDB = 'major';
  let base = 0;
  return function QGSimpleChord(): Question {
    if (index === 0) {
      ctype = Math.random() < 0.5 ? 'major' : 'minor';
      base = Math.random()*12|0;
    }
    const solution = solutionDB[ctype].slice(index, index+3).map(off => base+off);
    const q = {
      prompt: `${noteNameBase[ctype][base]}${ctype === 'major' ? '' : 'm'} (${invNames[index]})`,
      check: SimpleCheckerFactory(solution[0], solution.slice(1).map(x => x-solution[0])),
      solution,
    };
    // next
    index = (index+1)%3;
    return q;
  };
}

export const questionDummy: Question = {
  prompt: '',
  check: () => null,
  solution: [],
};

