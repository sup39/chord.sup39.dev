import Keyboard from '@/Keyboard';
import {getMIDIDevices, InputManager} from '%/midi';
import React, {useState, useEffect, useRef} from 'react';
import {Question, questionDummy} from '%/questions';

export function tryParseJSON(o: any): any {
  try {
    return JSON.parse(o);
  } catch {
    return undefined;
  }
}

function getHistory(lskey: string) {
  if (typeof localStorage === 'undefined') return {};
  const o = tryParseJSON(localStorage.getItem(lskey));
  if (o == null || typeof o !== 'object') return {};
  return Object.fromEntries(['totalCount', 'correctCount'].filter(k => k in o).map(k => [k, o[k]]));
}

export default function QuestionApp({questionGeneratorRef, lskeyPrefix}: {
  questionGeneratorRef: React.MutableRefObject<()=>Question>
  lskeyPrefix?: string
}) {
  const lskey = lskeyPrefix == null ? null : lskeyPrefix+'/count';
  const inputManagerRef = useRef(new InputManager());
  const questionRef = useRef(questionDummy);
  const [answer, setAnswerState] = useState<{
    correctCount: number
    totalCount: number
    notes: number[]
    correct: boolean|null
  }>({correctCount: 0, totalCount: 0, notes: [], correct: true});

  const tryNextQuestionRef = useRef((force=false) => {
    setAnswerState(o => {
      inputManagerRef.current.notes.clear();
      if (!force && o.correct == null) return o;
      questionRef.current = questionGeneratorRef.current();
      const count = {
        correctCount: o.correctCount,
        totalCount: o.totalCount+1,
      };
      lskey && localStorage.setItem(lskey, JSON.stringify(count));
      return {...count, notes: [], correct: null};
    });
  });
  useEffect(() => {
    getMIDIDevices()
      .then(([midi]) => {
        if (midi == null) {
          alert('MIDI not found');
          return;
        }
        const inputManager = inputManagerRef.current;
        midi.onmidimessage = ({data}: any) => {
          if (data.byteLength !== 3) return;
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
        };
        inputManager.callback = {
          noteChanged() {
            setAnswerState(o => {
              const {notes} = inputManager;
              if (o.correct != null) return o;
              const correct = questionRef.current.check(notes);
              const count = {
                totalCount: o.totalCount,
                correctCount: o.correctCount + (correct ? 1 : 0),
              };
              lskey && localStorage.setItem(lskey, JSON.stringify(count));
              return {
                ...count,
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
        // start
        setAnswerState(o => ({...o, ...(lskey ? getHistory(lskey) : {})}));
      });
    document.addEventListener('keydown', e => {
      if (e.key === ' ') {
        tryNextQuestionRef.current();
      }
    });
  }, [lskey]);

  const question = questionRef.current;
  return <>
    <section>
      <div className='Prompt'>{answer.correctCount} {'/'} {answer.totalCount}</div>
      <div className='Prompt'>{question.prompt}</div>
    </section>
    <section>
      {/* question.prompt === '' || answer.correct != null ? <div>真ん中のペダルを踏むと次の問題に進みます</div> : <></> */}
      {question.prompt === '' || answer.correct != null ?
        <button onClick={()=>tryNextQuestionRef.current(true)}>Next</button> : <></>}
      <h4>回答</h4>
      <Keyboard points={answer.notes} pointColor='#66f' shiftPoints={true} />
    </section>
    {question.prompt && answer.correct != null && <section>
      <h4>{answer.correct ? '正解！' : '不正解'}</h4>
      <Keyboard points={question.solution} pointColor='#f9f' shiftPoints={true} />
    </section>}
  </>;
}
