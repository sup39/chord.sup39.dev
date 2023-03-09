export type AnswerChecker = (notes: Set<number>) => boolean|null;
export const SimpleCheckerFactory: (base: number, extra?: number[]) => AnswerChecker = (base, extra=[]) => notes => {
  if (1+extra.length !== notes.size) return null;
  const baseU = Math.min(...notes.values());
  if (base%12 !== baseU%12) return false;
  return extra.every(off => notes.has(baseU+off));
};
