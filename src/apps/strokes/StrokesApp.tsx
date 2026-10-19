import { useEffect, useRef, useState } from 'react';
import { STROKES_BY_ID, STROKE_SETS, type Stroke } from '../../data/strokes';
import { burstConfetti } from '../../lib/confetti';
import { playDing, playPop, playTada } from '../../lib/sfx';
import { useLessonAudio } from '../grade-1c/useLessonAudio';
import { makeStrokeRound, type StrokeQuestion } from './game';
import './strokes.css';

function StrokeShape({ stroke, animate = false }: { stroke: Stroke; animate?: boolean }) {
  const [x, y] = stroke.path.match(/[\d.]+/g)!.map(Number);
  return <svg viewBox="0 0 100 100" className="stroke-shape" aria-hidden="true">
    <path className="stroke-grid" d="M50 0V100M0 50H100" />
    <path className="stroke-shadow" d={stroke.path} />
    <path className={animate ? 'stroke-ink drawing' : 'stroke-ink'} d={stroke.path} pathLength="1" />
    <circle cx={x} cy={y} r="3.5" className="stroke-start" />
  </svg>;
}

export default function StrokesApp({ onHome, homeLabel = 'Apps', initialAudio = true }: { onHome: () => void; homeLabel?: string; initialAudio?: boolean }) {
  const audio = useLessonAudio(initialAudio);
  const [setIndex, setSetIndex] = useState(0);
  const [mode, setMode] = useState<'learn' | 'play' | 'complete'>('learn');
  const [cardIndex, setCardIndex] = useState(0);
  const [round, setRound] = useState<StrokeQuestion[]>([]);
  const [index, setQuestionIndex] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const set = STROKE_SETS[setIndex];
  const stroke = mode === 'play' ? round[index].stroke : STROKES_BY_ID[set.ids[cardIndex]];

  useEffect(() => { audio.play(STROKES_BY_ID[STROKE_SETS[0].ids[0]].name); }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [mode, cardIndex, index, setIndex]);
  useEffect(() => { if (correct) next.current?.focus({ preventScroll: true }); }, [correct]);

  function hear(item = stroke) { audio.play(item.name); setAnimationKey(key => key + 1); }
  function selectSet(value: number) {
    audio.stop(); setSetIndex(value); setCardIndex(0); setMode('learn');
    hear(STROKES_BY_ID[STROKE_SETS[value].ids[0]]);
  }
  function start() {
    const questions = makeStrokeRound(setIndex);
    setRound(questions); setQuestionIndex(0); setScore(0); setWrong([]); setCorrect(false); setMode('play');
    hear(questions[0].stroke);
  }
  function answer(id: string) {
    if (correct || wrong.includes(id)) return;
    if (id !== stroke.id) {
      setWrong(previous => [...previous, id]);
      if (audio.enabled) playPop();
      hear();
      return;
    }
    setCorrect(true);
    if (!wrong.length) setScore(value => value + 1);
    if (audio.enabled) playDing();
    hear();
  }
  function advance() {
    if (!correct) return;
    audio.stop();
    if (index + 1 === round.length) {
      setMode('complete');
      if (audio.enabled) playTada();
      if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) burstConfetti();
      return;
    }
    setQuestionIndex(value => value + 1); setWrong([]); setCorrect(false); hear(round[index + 1].stroke);
  }

  return <div className="strokes-app">
    <div className="strokes-shell">
      <header className="strokes-header">
        <button className="strokes-button quiet" onClick={() => { audio.stop(); onHome(); }}>← {homeLabel}</button>
        <span>learncn.fun</span>
        <button className="strokes-button quiet" aria-pressed={audio.enabled} onClick={audio.toggle}>Sound {audio.enabled ? 'on' : 'off'}</button>
      </header>
      <main className="strokes-panel">
        <div className="strokes-eyebrow">Stroke playground · 笔画</div>
        <h1 ref={heading} tabIndex={-1}>{mode === 'complete' ? 'You know your strokes!' : mode === 'play' ? 'Find the stroke' : 'Meet the strokes'}</h1>
        <div className="strokes-tabs" role="group" aria-label="Stroke set">
          {STROKE_SETS.map((item, i) => <button key={item.id} className="strokes-button quiet" aria-pressed={setIndex === i} onClick={() => selectSet(i)}>{item.title}</button>)}
        </div>
        {mode === 'learn' && <>
          <p>Start at the gold dot. Watch, then say it!</p>
          <div className="stroke-study" key={`${stroke.id}-${animationKey}`}><StrokeShape stroke={stroke} animate /></div>
          <div className="stroke-name" lang="zh-CN">{stroke.name}</div>
          <div className="stroke-pinyin" lang="zh-Latn-pinyin">{stroke.pinyin}</div>
          <p>{stroke.english}</p>
          <button className="strokes-button" onClick={() => hear()}>↻ Watch{audio.enabled ? ' & listen' : ''}</button>
          <div className="strokes-nav">
            <button className="strokes-button quiet" disabled={cardIndex === 0} onClick={() => { setCardIndex(value => value - 1); hear(STROKES_BY_ID[set.ids[cardIndex - 1]]); }}>Back</button>
            <span>{cardIndex + 1} / {set.ids.length}</span>
            <button className="strokes-button" onClick={() => { if (cardIndex + 1 === set.ids.length) start(); else { setCardIndex(value => value + 1); hear(STROKES_BY_ID[set.ids[cardIndex + 1]]); } }}>{cardIndex + 1 === set.ids.length ? 'Play →' : 'Next →'}</button>
          </div>
          <button className="strokes-text-button" onClick={start}>Play now</button>
        </>}
        {mode === 'play' && <>
          <progress value={index + (correct ? 1 : 0)} max={round.length} aria-label="Strokes found" />
          <div className="strokes-fish" aria-label={`${index + (correct ? 1 : 0)} of ${round.length} strokes found`}>{round.map((_, i) => <span key={i} aria-hidden="true" className={i < index + (correct ? 1 : 0) ? 'found' : ''}>🐟</span>)}</div>
          <button className="strokes-listen" disabled={!audio.enabled} aria-label={`Hear ${stroke.name}`} onClick={() => hear()}><span lang="zh-CN">{stroke.name}</span><span lang="zh-Latn-pinyin">{stroke.pinyin}</span>{audio.enabled && <small>🔊 Listen</small>}</button>
          <p>Tap the matching shape.</p>
          <div className="stroke-options" role="group" aria-label="Stroke shapes">
            {round[index].options.map((option, i) => <button key={option.id} aria-label={`Shape ${i + 1}: ${option.english}`} disabled={correct || wrong.includes(option.id)} onClick={() => answer(option.id)} className={`stroke-choice ${wrong.includes(option.id) ? 'wrong' : ''} ${correct && option.id === stroke.id ? 'correct' : ''}`}>
              <StrokeShape stroke={option} /><span>{wrong.includes(option.id) ? 'Try again' : correct && option.id === stroke.id ? '✓ Yes!' : i + 1}</span>
            </button>)}
          </div>
          <p className="strokes-feedback" role="status">{correct ? `${stroke.name} · ${stroke.english}!` : wrong.length ? 'Good try. Pick another shape.' : '\u00a0'}</p>
          {correct && <button ref={next} className="strokes-button" onClick={advance}>{index + 1 === round.length ? 'Finish ★' : 'Next →'}</button>}
        </>}
        {mode === 'complete' && <>
          <div className="strokes-celebration" aria-hidden="true">🐧 ★ 🐟</div>
          <p>You found all {round.length} strokes.</p>
          <p>{score} on the first try!</p>
          <div className="strokes-summary">{round.map(item => <button className="strokes-button quiet" key={item.stroke.id} onClick={() => hear(item.stroke)}><span lang="zh-CN">{item.stroke.name}</span> · {item.stroke.pinyin}</button>)}</div>
          <div className="strokes-nav"><button className="strokes-button quiet" onClick={() => selectSet(setIndex === 0 ? 1 : 0)}>{setIndex === 0 ? 'Try turns & hooks' : 'First strokes'}</button><button className="strokes-button" onClick={start}>Play again</button></div>
        </>}
        {audio.message && <p className="strokes-audio-notice" role="status">{audio.message}</p>}
      </main>
    </div>
  </div>;
}
