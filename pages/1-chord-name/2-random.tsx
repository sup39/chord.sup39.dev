import {useState, useEffect, useRef} from 'react';
import MDXRoot from '@/MDXRoot';
import QuestionApp from '@/QuestionApp';
import {defaultQFChordRandomInv, makeQGChordRandomInv, qtypes, QType} from '%/questions';
import {getConfig} from '%/localStorage';

const lskeyPrefix = 'practice/1-2/';
const lskeyConfig = lskeyPrefix+'config';
const defaultConfig = {
  qtype: 'order' as QType,
};

const meta = {
  title: '1-2. 転回形(ランダム)',
  description: '転回形(ランダム)の練習ツール',
};
export default function App({router}: {
  router: Parameters<typeof MDXRoot>[0]['router']
}) {
  const [qtype, setQtype] = useState<QType>('order');
  useEffect(() => {
    const config = getConfig(lskeyConfig, defaultConfig);
    setQtype(config.qtype);
  }, []);
  useEffect(() => {
    localStorage.setItem(lskeyConfig, JSON.stringify({qtype}));
  }, [qtype]);
  const qg = useRef(makeQGChordRandomInv(qtype, defaultQFChordRandomInv));
  return <MDXRoot meta={meta} headings={[]} router={router}><>
    <section className="QuestionConfig">
      <span>問題形式：</span>
      {qtypes.map(({value, label}) =>
        <button key={value} onClick={()=>{
          setQtype(value);
          qg.current = makeQGChordRandomInv(value, defaultQFChordRandomInv);
        }} className={value === qtype ? 'Selected' : ''}>{label}</button>,
      )}
    </section>
    <QuestionApp questionGeneratorRef={qg} lskeyPrefix={lskeyPrefix} />
  </></MDXRoot>;
}
