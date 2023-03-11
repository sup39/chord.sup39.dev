import {useState, useEffect, useRef} from 'react';
import {getMIDIDevices} from '%/midi';
import type {AppProps} from 'next/app';
import {io} from 'socket.io-client';
import MDXRoot from '@/MDXRoot';
import Keyboard from '@/Keyboard';

const meta = {
  title: 'リモートMIDI',
  description: 'socket.ioを使ってMIDI入力をリモートに送信するツールです',
};
const url0 = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('url');
export default function App({router}: {router: AppProps['router']}) {
  const [url, setUrl] = useState(url0 ?? '');
  const [{text: msg, disabled, connected}, setConnectStatus] =
    useState({text: '', disabled: false, connected: false});
  const socketRef = useRef<ReturnType<typeof io>>();
  const [remoteState, setRemoteState] = useState({
    correct: null as boolean|null,
    correctCount: 0,
    totalCount: 0,
    timer: null as number|null,
    totalTimeC: 0,
    prompt: '',
    notes: [] as number[],
    solution: [] as number[],
  });

  const connectRef = useRef((url: string) => {
    setConnectStatus({text: 'Connecting...', disabled: true, connected: false});
    const socket = io(url, {reconnection: false});
    socket.on('connect', () => {
      setConnectStatus({text: 'Connected', disabled: true, connected: true});
    });
    socket.on('connect_error', err => {
      console.error(err);
      setConnectStatus({text: `Fail to connect to ${url}`, disabled: false, connected: false});
    });
    socket.on('state', o => {
      setRemoteState(o0 => ({...o0, ...o}));
    });
    socketRef.current = socket;
  });
  useEffect(() => {
    if (url0) connectRef.current(url0);
    getMIDIDevices().then(([midi]) => {
      if (midi == null) {
        alert('MIDI not found');
        return;
      }
      midi.onmidimessage = ({data}: any) => {
        if (data.byteLength !== 3) return;
        const socket = socketRef.current;
        if (socket == null) return;
        socket.emit('midi', data);
      };
    });
  }, []);

  return <MDXRoot meta={meta} headings={[]} router={router}><>
    <section>
      <form onSubmit={e => {
        e.preventDefault();
        connectRef.current(url);
      }}>
        <span>Server URL: </span><input value={url} onChange={e => setUrl(e.target.value)} />
        <input type="submit" value="Connect" disabled={disabled} style={{marginLeft: '0.5em'}} />
      </form>
      <div>{msg}</div>
    </section>
    {connected && <section>
      <section>
        <div className='Prompt'>
          <span>{remoteState.correctCount} {'/'} {remoteState.totalCount}</span>
        </div>
        <div>
          平均時間：{remoteState.correctCount === 0 ? 'N/A' : (remoteState.totalTimeC/remoteState.correctCount/1000).toFixed(3)+'秒'}</div>
        <div>回答時間：{remoteState.timer == null ? '' : (remoteState.timer/1000).toFixed(3)+'秒'}</div>
        <div className='Prompt'>{remoteState.prompt}</div>
      </section>
      <section>
        <h4>回答</h4>
        <Keyboard points={remoteState.notes} pointColor='#66f' shiftPoints={true} />
      </section>
      {remoteState.prompt && remoteState.correct != null && <section>
        <h4>{remoteState.correct ? '正解！' : '不正解'}</h4>
        <Keyboard points={remoteState.solution} pointColor='#f9f' shiftPoints={true} />
      </section>}
    </section>}
  </></MDXRoot>;
}
