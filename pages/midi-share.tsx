import {useState, useEffect, useRef} from 'react';
import {getMIDIDevices} from '%/midi';
import type {AppProps} from 'next/app';
import {io} from 'socket.io-client';
import MDXRoot from '@/MDXRoot';

const meta = {
  title: 'MIDIシェア',
  description: 'socket.io経由でMIDI入力をシェアするツールです',
};
export default function App({router}: {router: AppProps['router']}) {
  const [url, setUrl] = useState(
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('url') ?? '');
  const [disabled, setDisable] = useState(false);
  const [msg, setMsg] = useState('');
  const socketRef = useRef<ReturnType<typeof io>>();
  function connect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDisable(true);
    const _url = url;
    const socket = io(_url, {reconnection: false});
    socket.on('connect', () => {
      setMsg(`Connected`);
    });
    socket.on('connect_error', err => {
      setMsg(`Fail to connect to ${_url}`);
      console.error(err);
      setDisable(false);
    });
    socketRef.current = socket;
  }
  useEffect(() => {
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
  });
  return <MDXRoot meta={meta} headings={[]} router={router}><>
    <section>
      <form onSubmit={connect}>
        <span>Server URL: </span><input value={url} onChange={e => setUrl(e.target.value)} />
        <input type="submit" value="Connect" disabled={disabled} style={{marginLeft: '0.5em'}} />
      </form>
      <div>{msg}</div>
    </section>
  </></MDXRoot>;
}
