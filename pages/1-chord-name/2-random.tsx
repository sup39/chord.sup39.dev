import {useState, useEffect, useRef} from 'react';
import MDXRoot from '@/MDXRoot';
import QuestionApp from '@/QuestionApp';
import {defaultQFChordRandomInv, makeQGChordRandomInv} from '%/questions';
import {getConfig} from '%/localStorage';

export type QType = Parameters<typeof makeQGChordRandomInv>[0];
const qtypes: {value: QType, label: string}[] = [
  {value: 'order', label: 'C (第二転回形)'},
  {value: 'root', label: '　C/G　'},
  {value: 'highest', label: 'C (最高音: E)'},
];

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
