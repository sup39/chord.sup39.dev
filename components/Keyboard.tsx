const keyboardHeight = 150/2;
const octaveWidth = 157.5;
const keyInfoDB = new Proxy([
  {color: 'white', x:   0.0},
  {color: 'black', x:  13.0},
  {color: 'white', x:  22.5},
  {color: 'black', x:  40.0},
  {color: 'white', x:  45.0},
  {color: 'white', x:  67.5},
  {color: 'black', x:  79.5},
  {color: 'white', x:  90.0},
  {color: 'black', x: 105.5},
  {color: 'white', x: 112.5},
  {color: 'black', x: 131.5},
  {color: 'white', x: 135.0},
].map(o => ({...o, ...(o.color==='white' ? {w: 22.5, h: 150/2} : {w: 14, h: 95/2})})), {
  get(db, key) {
    if (typeof key === 'symbol') return undefined;
    const idx = parseInt(key);
    const info0 = db[idx%12];
    return {...info0, x: info0.x+octaveWidth*Math.floor(idx/12)};
  },
});

export default function Keyboard({
  base=0, keyCount=24, points=[], shiftPoints=true, margin=10, strokeWidth=1,
  pointColor='#f9f', whiteColor='#eee', blackColor='#000', whiteStroke='#000',
}: {
  base?: number
  keyCount?: number
  points?: number[]
  shiftPoints?: boolean
  margin?: number
  strokeWidth?: number
  pointColor?: string
  whiteColor?: string
  blackColor?: string
  whiteStroke?: string
}) {
  const keys = Array.from({length: keyCount}, (_, i) => keyInfoDB[base+i]);
  const keyLast = keys[keys.length-1];
  const x0 = keys[0].x;
  const keyboardWidth = keyLast.x + keyLast.w - x0;
  if (shiftPoints) {
    const pointMin = Math.min(...points);
    const shift = Math.floor((pointMin-base)/12)*12;
    points = points.map(x => x-shift);
  }
  return <svg viewBox={`${x0-margin} ${-margin} ${keyboardWidth+margin*2} ${keyboardHeight+margin*2}`}>
    {keys.filter(o => o.color === 'white').map(o =>
      <rect key={'w'+o.x} x={o.x} y={0} width={o.w} height={o.h}
        fill={whiteColor} stroke={whiteStroke} strokeWidth={strokeWidth} />,
    )}
    {keys.filter(o => o.color === 'black').map(o =>
      <rect key={'b'+o.x} x={o.x} y={0} width={o.w} height={o.h} fill={blackColor} />,
    )}
    {points.map(i => {
      const {x, w, h} = keyInfoDB[i];
      return <circle key={'c'+i} cx={x+w/2} cy={h-12} r={4} fill={pointColor} />;
    })}
  </svg>;
}
