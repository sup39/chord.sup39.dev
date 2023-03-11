import Keyboard from '@/Keyboard';
import {getMIDIDevices, InputManager} from '%/midi';
import React, {useState, useEffect, useRef} from 'react';
import {Question, questionDummy} from '%/questions';
import {getConfig} from '%/localStorage';
import {io} from 'socket.io-client';

const defaultConfig = {
  totalCount: 0,
  correctCount: 0,
  totalTimeC: 0,
};

const defaultAnswerState = {correctCount: 0, totalCount: 0, notes: [], correct: true, totalTimeC: 0};
export default function QuestionApp({questionGeneratorRef, lskeyPrefix}: {
  questionGeneratorRef: React.MutableRefObject<()=>Question>
  lskeyPrefix?: string
}) {
  const lskey = lskeyPrefix == null ? null : lskeyPrefix+'stats';
  const inputManagerRef = useRef(new InputManager());
  const questionRef = useRef(questionDummy);
  const [answer, setAnswerState] = useState<{
    correctCount: number
    totalCount: number
    notes: number[]
    correct: boolean|null
    totalTimeC: number
  }>(defaultAnswerState);
  const startTimeQRef = useRef(0);
  const [timer, setTimer] = useState<number>(0);
  const animFrameRef = useRef(NaN);

  function updateTimer() {
    const now = +new Date();
    setTimer(now-startTimeQRef.current);
    animFrameRef.current = requestAnimationFrame(updateTimer);
  }

  const tryNextQuestionRef = useRef(() => {
    setAnswerState(o => {
      if (o.correct == null) return o;
      inputManagerRef.current.notes.clear();
      questionRef.current = questionGeneratorRef.current();
      startTimeQRef.current = +new Date();
      updateTimer();
      return {
        ...o,
        totalCount: o.totalCount+1,
        notes: [],
        correct: null,
      };
    });
  });
  useEffect(() => {
    const inputManager = inputManagerRef.current;
    // input manager
    inputManager.callback = {
      noteChanged() {
        setAnswerState(o => {
          const {notes} = inputManager;
          if (o.correct != null) return o;
          const correct = questionRef.current.check(notes);
          // if answer submitted
          const stats = {
            totalCount: o.totalCount,
            correctCount: o.correctCount,
            totalTimeC: o.totalTimeC,
          };
          if (correct != null) {
            cancelAnimationFrame(animFrameRef.current);
            const dt = +new Date() - startTimeQRef.current;
            setTimer(dt);
            // update stats
            if (correct) {
              stats.correctCount++;
              stats.totalTimeC += dt;
            }
            lskey && localStorage.setItem(lskey, JSON.stringify(stats));
          }
          // return
          return {
            ...stats,
            notes: Array.from(notes),
            correct,
          };
        });
      },
      pedalOn(id) {
        if (id === 0x42) {
          tryNextQuestionRef.current();
        }
      },
    };

    // handle midi message
    function onMidiMessage(data: Uint8Array) {
      if (data.byteLength !== 3) return;
      const inputManager = inputManagerRef.current;
      const [et, id, v] = data;
      if (et === 0x80) {
        inputManager.noteOff(id);
        return;
      } else if (et === 0x90) {
        inputManager.noteOn(id);
      } else if (et === 0xB0) {
        // {0x40: 'R', 0x42: 'M', 0x43: 'L'}
        inputManager.pedal(id, v);
      } else {
        return;
      }
    }

    // connect socket.io server if specified via url query `midi`
    // o.w. check midi
    const url = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('midi');
    if (url != null) {
      const socket = io(url, {reconnection: false});
      socket.on('connect', () => {
        console.log(`Connected`);
        socket.on('midi', data => onMidiMessage(new Uint8Array(data)));
      });
      socket.on('connect_error', err => {
        alert(`Fail to connect to ${url}`);
        console.error(err);
      });
    } else {
      getMIDIDevices().then(([midi]) => {
        if (midi == null) {
          if (url == null) alert('MIDI not found');
          return;
        }
        midi.onmidimessage = ({data}: any) => onMidiMessage(data);
        // start
        setAnswerState(o => ({...o, ...(lskey != null ? getConfig(lskey, defaultConfig) : {})}));
      });
      document.addEventListener('keydown', e => {
        if (e.key === ' ') {
          tryNextQuestionRef.current();
        }
      });
    }
  }, [lskey]);

  function reset() {
    if (window.confirm('本当にリセットしますか？')) {
      if (lskey != null) {
        localStorage.setItem(lskey, JSON.stringify(defaultConfig));
      }
      questionRef.current = questionDummy;
      cancelAnimationFrame(animFrameRef.current);
      setTimer(0);
      setAnswerState({...defaultAnswerState});
    }
  }

  const question = questionRef.current;
  return <>
    <section>
      <div className='Prompt'>
        <span>{answer.correctCount} {'/'} {answer.totalCount}</span>
      </div>
      <div>
        平均時間：{answer.correctCount === 0 ? 'N/A' : (answer.totalTimeC/answer.correctCount/1000).toFixed(3)+'秒'}</div>
      <div>回答時間：{(timer/1000).toFixed(3)}秒</div>
      <div className='Prompt'>{question.prompt}</div>
    </section>
    <section>
      {/* question.prompt === '' || answer.correct != null ? <div>真ん中のペダルを踏むと次の問題に進みます</div> : <></> */}
      {question.prompt === '' || answer.correct != null ?
        <button onClick={()=>tryNextQuestionRef.current()}>Next</button> : <></>}
      <h4>回答</h4>
      <Keyboard points={answer.notes} pointColor='#66f' shiftPoints={true} />
    </section>
    {question.prompt && answer.correct != null && <section>
      <h4>{answer.correct ? '正解！' : '不正解'}</h4>
      <Keyboard points={question.solution} pointColor='#f9f' shiftPoints={true} />
    </section>}
    <button className="danger" onClick={reset}>リセット</button>
  </>;
}
