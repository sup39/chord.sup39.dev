import {useRef} from 'react';
import MDXRoot from '@/MDXRoot';
import QuestionApp from '@/QuestionApp';
import {makeQGChordFixedInv} from '%/questions';

const lskeyPrefix = 'practice/1-1/';
const meta = {
  title: '1-1. 転回形(固定)',
  description: '転回形(固定)の練習ツール',
};
export default function App({router}: {
  router: Parameters<typeof MDXRoot>[0]['router']
}) {
  return <MDXRoot meta={meta} headings={[]} router={router}><>
    <QuestionApp questionGeneratorRef={useRef(makeQGChordFixedInv())} lskeyPrefix={lskeyPrefix} />
  </></MDXRoot>;
}
