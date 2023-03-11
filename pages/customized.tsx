import {useState, useEffect, useRef} from 'react';
import MDXRoot from '@/MDXRoot';
import QuestionApp from '@/QuestionApp';
import {noteNameDB} from '%/note';
import {makeIndepQFChordRandomInv, makeQGChordRandomInv, qtypes, QType} from '%/questions';
import {getConfig} from '%/localStorage';

const cinvList = [
  {ctype: 'power', iinv: 0, label: 'Power(基本形)'},
  {ctype: 'power', iinv: 1, label: 'Power(転回形)'},
  {ctype: 'major', iinv: 0, label: 'Major(基本形)'},
  {ctype: 'major', iinv: 1, label: 'Major(第一転回形)'},
  {ctype: 'major', iinv: 2, label: 'Major(第二転回形)'},
  {ctype: 'minor', iinv: 0, label: 'Minor(基本形)'},
  {ctype: 'minor', iinv: 1, label: 'Minor(第一転回形)'},
  {ctype: 'minor', iinv: 2, label: 'Minor(第二転回形)'},
] as const;
const baseList = noteNameDB.dominant.map((db, i) => db[i]);
const defaultConfig = {
  qtype: 'order' as QType,
  cinvSel: cinvList.map(() => false),
  baseSel: baseList.map(() => false),
};

const lskeyPrefix = 'practice/customized/';
const lskeyConfig = lskeyPrefix+'config';
const meta = {
  title: 'カスタマイズ練習',
  description: 'カスタマイズ和音練習ツール',
};
export default function App({router}: {
  router: Parameters<typeof MDXRoot>[0]['router']
}) {
  const [{qtype, cinvSel, baseSel}, setConfig] = useState<typeof defaultConfig>(defaultConfig);
  const cinv = cinvList.filter((_, i) => cinvSel[i]);
  const base = baseSel.flatMap((e, i) => e ? [i] : []);
  const qg = makeQGChordRandomInv(qtype, makeIndepQFChordRandomInv({cinv, base}));
  const qgRef = useRef(qg);
  qgRef.current = qg;
  useEffect(() => {
    setConfig(getConfig(lskeyConfig, defaultConfig));
  }, []);
  useEffect(() => {
    localStorage.setItem(lskeyConfig, JSON.stringify({qtype, cinvSel, baseSel}));
  }, [qtype, cinvSel, baseSel]);
  return <MDXRoot meta={meta} headings={[]} router={router}><>
    <section className="QuestionConfig">
      <div>
        <span>問題形式：</span>
        {qtypes.map(({value, label}) =>
          <button key={value} className={value === qtype ? 'Selected' : ''}
            onClick={()=>setConfig(o => ({...o, qtype: value}))}>{label}</button>,
        )}
      </div>
      <div>
        <span>和音タイプ：</span>
        {cinvList.map(({label}, i) =>
          <button key={'cinv'+i} className={cinvSel[i] ? 'Selected' : ''}
            onClick={()=>setConfig(o => {
              const cinvSel = o.cinvSel.slice();
              cinvSel[i] = !cinvSel[i];
              return {...o, cinvSel};
            })}>{label}</button>,
        )}
      </div>
      <div>
        <span>ルート：</span>
        {baseList.map((label, i) =>
          <button key={'base'+i} className={baseSel[i] ? 'Selected' : ''}
            onClick={()=>setConfig(o => {
              const baseSel = o.baseSel.slice();
              baseSel[i] = !baseSel[i];
              return {...o, baseSel};
            })}>{label}</button>,
        )}
      </div>
    </section>
    <QuestionApp questionGeneratorRef={qgRef} lskeyPrefix={lskeyPrefix} />
  </></MDXRoot>;
}
