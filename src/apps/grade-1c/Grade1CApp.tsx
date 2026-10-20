import { useEffect, useRef, useState, type CSSProperties } from "react";
import { burstConfetti } from "../../lib/confetti";
import { playDing, playTada } from "../../lib/sfx";
import type { Lesson, Word } from "./curriculum";
import { LESSONS, WEEKS, availableLessons, currentSchoolWeek } from "./weekly-curriculum";
import { makeReview, PROGRESS_KEY, saveCompletion, type Progress, type Question } from "./game";
import { choosePractice, continuousUnlocked, parseWordHistory, PRACTICE_PROGRESS_KEY, practiceRound, practiceQuestion, priority, readPracticeProgress, recordResult, skillFor, wordKey, WORD_HISTORY_KEY, type WordHistory } from "./practice";
import { useLessonAudio } from "./useLessonAudio";
import PenguinPath from "./PenguinPath";
import { POLAR_ART, nextIceLesson } from "./ice-path";
import TraceCharacter from "./TraceCharacter";
import StrokesApp from "../strokes/StrokesApp";
import { PwaInstallPrompt } from "../../components/PwaInstall";

type Screen = "home" | "play" | "complete" | "strokes";
type Run = { original: Question[]; questions: Question[]; index: number; reviewing: boolean; missed: string[]; firstTry: number; continuous: boolean; practiced: number };
function stored(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
function SoundIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z" strokeLinejoin="round"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" strokeLinecap="round"/></svg>; }

export default function Grade1CApp() {
  const [currentWeek, setCurrentWeek] = useState(currentSchoolWeek);
  const [screen, setScreen] = useState<Screen>("home");
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [progress, setProgress] = useState<Progress>(() => readPracticeProgress(stored(PRACTICE_PROGRESS_KEY), stored(PROGRESS_KEY)));
  const [history, setHistory] = useState<WordHistory>(() => parseWordHistory(stored(WORD_HISTORY_KEY)));
  const historyRef = useRef(history);
  const [mapPosition, setMapPosition] = useState(() => { const id = nextIceLesson(progress, undefined, currentWeek); return { from: id, to: id }; });
  const [run, setRun] = useState<Run | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"" | "wrong" | "correct">("");
  const [hint, setHint] = useState(false);
  const [traceFallback, setTraceFallback] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const [notice, setNotice] = useState("");
  const recorded = useRef(false);
  const solvedOnce = useRef(false);
  const recent = useRef<string[]>([]);
  const sequence = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const audio = useLessonAudio();
  const question = run?.questions[run.index];
  const available = availableLessons(currentWeek);
  const completed = available.filter(item => progress[item.id]).length;
  const unlocked = continuousUnlocked(progress, currentWeek);
  const nextLessonId = nextIceLesson(progress, lesson.id, currentWeek);
  const tricky = Object.entries(history).filter(([, result]) => result.difficulty >= .25).sort((a, b) => priority(b[1]) - priority(a[1])).slice(0, 8);

  useEffect(() => {
    const refresh = () => setCurrentWeek(currentSchoolWeek());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [screen, question?.id]);
  useEffect(() => { if (screen !== "home") window.scrollTo(0, 0); }, [screen]);
  useEffect(() => { if (feedback === "correct") nextButton.current?.focus({ preventScroll: true }); }, [feedback]);

  function save(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { setStorageNotice("Progress lasts for this visit. This browser isn't allowing it to be saved."); }
  }
  function resetAnswer() { setWrong([]); setFeedback(""); setHint(false); setTraceFallback(false); recorded.current = false; solvedOnce.current = false; }
  function showMap(destination = lesson.id) {
    audio.stop(); setMapPosition({ from: lesson.id, to: destination }); setScreen("home"); setRun(null); resetAnswer();
  }
  function readQuestion(item: Question) {
    // No teaching cards or narrated instructions: speak only the practice target.
    if (item.mode === "trace") audio.play(item.word.hanzi);
  }
  function startLesson(item: Lesson) {
    if (item.week > currentSchoolWeek()) return;
    audio.stop(); setNotice(""); setLesson(item); resetAnswer();
    const questions = practiceRound(item);
    setRun({ original: questions, questions, index: 0, reviewing: false, missed: [], firstTry: 0, continuous: false, practiced: 0 });
    setScreen("play"); readQuestion(questions[0]);
  }
  function startContinuous() {
    if (!continuousUnlocked(progress, currentSchoolWeek())) return;
    recent.current = []; sequence.current = 0; setNotice("");
    nextContinuous(0);
  }
  function nextContinuous(practiced: number) {
    if (!continuousUnlocked(progress, currentSchoolWeek())) {
      showMap(nextIceLesson(progress)); setNotice("A new week is open. Complete its reading and writing to continue."); return;
    }
    const item = choosePractice(historyRef.current, currentSchoolWeek(), recent.current);
    if (!item) return;
    recent.current = [...recent.current.slice(-2), item.key];
    const q = practiceQuestion(item.lesson, item.word, `continuous-${++sequence.current}`);
    audio.stop(); resetAnswer(); setLesson(item.lesson);
    setRun({ original: [q], questions: [q], index: 0, reviewing: false, missed: [], firstTry: 0, continuous: true, practiced });
    setScreen("play"); readQuestion(q);
  }
  function record(outcome: "correct" | "miss" | "hint") {
    if (!question || recorded.current) return;
    recorded.current = true;
    const updated = recordResult(historyRef.current, wordKey(lesson, question.word), outcome);
    historyRef.current = updated; setHistory(updated); save(WORD_HISTORY_KEY, updated);
  }
  function markMissed(outcome: "miss" | "hint") {
    if (!question || solvedOnce.current) return;
    record(outcome);
    setRun(current => current && !current.reviewing && !current.missed.includes(question.word.id) ? { ...current, missed: [...current.missed, question.word.id] } : current);
  }
  function solved(lastStrokeName?: string) {
    if (!question || solvedOnce.current) return;
    solvedOnce.current = true;
    // A tap fallback isn't evidence of successful handwriting.
    if (!traceFallback) record("correct");
    if (!wrong.length && !hint && !traceFallback) setRun(current => current && !current.reviewing ? { ...current, firstTry: current.firstTry + 1 } : current);
    setFeedback("correct"); if (audio.enabled) playDing();
    audio.narrate([...(lastStrokeName ? [{ text: lastStrokeName, language: "zh" as const }] : []), { text: question.word.hanzi, language: "zh" }]);
  }
  function answer(id: string) {
    if (!question || solvedOnce.current) return;
    if (id === question.word.id) { solved(); return; }
    setWrong(previous => [...new Set([...previous, id])]); setFeedback("wrong");
    if (!traceFallback) markMissed("miss");
  }
  function finish() {
    if (!run) return;
    const updated = saveCompletion(progress, lesson.id, run.firstTry / run.original.length);
    setProgress(updated); save(PRACTICE_PROGRESS_KEY, updated); setScreen("complete"); audio.stop();
    if (audio.enabled) playTada();
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) burstConfetti();
  }
  function advance() {
    if (!run || feedback !== "correct") return;
    if (run.continuous) { nextContinuous(run.practiced + 1); return; }
    audio.stop(); resetAnswer();
    if (run.index + 1 < run.questions.length) { setRun({ ...run, index: run.index + 1 }); readQuestion(run.questions[run.index + 1]); return; }
    if (!run.reviewing && run.missed.length) {
      const review = makeReview(run.original, run.missed).map(q => ({ ...q, id: `${q.id}-review` }));
      setRun({ ...run, questions: review, index: 0, reviewing: true }); readQuestion(review[0]); return;
    }
    finish();
  }
  function detail(word: Word) { return <div className="one-c-word-answer"><div className="one-c-answer-hanzi" lang="zh-CN">{word.hanzi}</div><div className="one-c-pinyin" lang="zh-Latn-pinyin">{word.pinyin}</div><div>{word.english}</div></div>; }
  function listen(word: Word, slow = false) { audio.play(word.hanzi, "zh", slow); }
  if (screen === "strokes") return <StrokesApp homeLabel="Map" initialAudio={audio.enabled} onHome={() => setScreen("home")} />;

  return <div className="one-c" style={{ "--lesson-accent": lesson.kind === "writing" ? "#6ee7b7" : "#67e8f9" } as CSSProperties}><div className="one-c-shell">
    <header className="one-c-header"><a className="one-c-brand" href="/">learncn<span>.fun</span></a><div className="one-c-header-actions">
      {screen !== "home" && <button className="one-c-button quiet" aria-label={run?.continuous ? "End continuous practice" : "Back to the ice path"} onClick={() => { if (run?.continuous) setNotice(`${run.practiced + Number(feedback === "correct")} characters practiced.`); showMap(); }}>{run?.continuous ? "End practice" : "Map"}</button>}
      <button className="one-c-sound-toggle" aria-label={audio.enabled ? "Turn sound off" : "Turn sound on"} aria-pressed={audio.enabled} onClick={audio.toggle}><SoundIcon/><span>Sound</span></button>
    </div></header>
    <main>
      {screen === "home" && <><PwaInstallPrompt/>
        <section className="one-c-continuous" aria-label="Continuous practice">
          <div><h2>Continuous play</h2><p>{unlocked ? "Read and write, with extra practice for tricky characters." : `Complete Read and Write in weeks 1–${currentWeek || 1} to unlock.`}</p><span className="one-c-small">{completed} / {available.length} activities complete</span></div>
          <button className="one-c-button primary" disabled={!unlocked} onClick={startContinuous}>{unlocked ? "Continuous play →" : "🔒 Continuous play"}</button>
        </section>
        {notice && <p role="status" className="one-c-review-note">{notice}</p>}
        {tricky.length > 0 && <section className="one-c-tricky"><h2>Getting extra practice</h2><div>{tricky.map(([key, result]) => <span key={key}><strong lang="zh-CN">{key.split(":")[1]}</strong> {key.startsWith("write:") ? "Writing" : "Reading"}<small>{result.misses} {result.misses === 1 ? "tricky attempt" : "tricky attempts"}</small></span>)}</div></section>}
        <PenguinPath currentWeek={currentWeek} progress={progress} initialLessonId={mapPosition.from} destinationLessonId={mapPosition.to} onStart={startLesson} headingRef={heading}/>
        <div className="one-c-audio-controls"><button className="one-c-button secondary" onClick={() => { audio.stop(); setScreen("strokes"); }}>✏️ Learn strokes · 笔画</button></div>

        <details className="one-c-family-note"><summary>For grown-ups</summary><p>19 weeks, with separate reading and writing lists from the full Grade 1 character sheet. Each chapter maps to the same numbered week. Weeks open on Mondays, using the September 1, 2026 school start and Pacific time.</p><p>Practice starts immediately. Mistakes and hints give characters more weight in continuous play; successful practice gradually reduces that extra weight. Reading and handwriting are tracked separately. Only available weeks enter the practice pool.</p><p>Progress and word history stay in this browser. Earlier character-practice stars are carried over where they cover a whole new activity; the old save is retained. No microphone or account is needed.</p></details>
      </>}
      {screen === "play" && run && question && <section className="one-c-activity">
        <div className="one-c-activity-heading"><div><div className="one-c-eyebrow">{run.continuous ? "Continuous play" : `Week ${lesson.week}`} · {skillFor(lesson) === "write" ? "Write" : "Read"}{run.reviewing ? " · Review" : ""}</div><h1 ref={heading} tabIndex={-1}>{question.mode === "trace" ? traceFallback ? "Find the character" : "Write the character" : "What does this mean?"}</h1></div><span className="one-c-step-count">{run.continuous ? `${run.practiced} practiced` : `${run.index + 1} / ${run.questions.length}`}</span></div>
        {!run.continuous && <progress className="one-c-progress" value={run.index + Number(feedback === "correct")} max={run.questions.length} aria-label={run.reviewing ? "Review progress" : "Practice progress"}/>}
        <div className="one-c-play-card">
          {question.mode === "meaning" ? <div className="one-c-prompt-hanzi" lang="zh-CN">{question.word.hanzi}</div> : <><div className="one-c-prompt-english">{question.word.english}</div><div className="one-c-pinyin" lang="zh-Latn-pinyin">{question.word.pinyin}</div></>}
          <div className="one-c-audio-controls"><button className="one-c-button secondary" disabled={!audio.enabled} onClick={() => listen(question.word)}><SoundIcon/> Listen</button><button className="one-c-button quiet" disabled={!audio.enabled} onClick={() => listen(question.word, true)}>Slow</button></div>
          {question.mode === "trace" && !traceFallback && <TraceCharacter key={question.id} hanzi={question.word.hanzi} onStrokeName={name => audio.play(name)} onComplete={solved} onHelp={() => { markMissed("hint"); setHint(true); }} onFallback={() => setTraceFallback(true)}/>}
          {traceFallback && <p className="one-c-small">Drawing unavailable? You can finish with a tap. <button className="one-c-text-button" onClick={() => setTraceFallback(false)}>Try drawing again</button></p>}
          {(question.mode !== "trace" || traceFallback) && <div className="one-c-options sentence-choices" role="group" aria-label="Answer choices">{question.options.map(option => <button key={option.id} className={`one-c-option ${traceFallback ? "chinese" : ""} ${wrong.includes(option.id) ? "wrong" : ""}`} disabled={wrong.includes(option.id) || feedback === "correct"} onClick={() => answer(option.id)}><span className="one-c-option-label" lang={traceFallback ? "zh-CN" : "en"}>{traceFallback ? option.hanzi : option.english}</span></button>)}</div>}
          {feedback !== "correct" && question.mode !== "trace" && <div className="one-c-hint">{hint ? detail(question.word) : <button className="one-c-text-button" onClick={() => { setHint(true); markMissed("hint"); }}>Hint</button>}</div>}
        </div>
        <div className={`one-c-feedback ${feedback}`} aria-live="polite" aria-atomic="true">
          {feedback === "wrong" && <p>Try again.</p>}
          {feedback === "correct" && <><div><strong>✓</strong>{detail(question.word)}</div><button className="one-c-button primary" ref={nextButton} aria-label={run.continuous ? "Next practice question" : "Next question"} onClick={advance}>{run.continuous || run.index + 1 < run.questions.length ? "Next" : !run.reviewing && run.missed.length ? "Review" : "Done"} →</button></>}
        </div>
      </section>}
      {screen === "complete" && run && <section className="one-c-complete">
        <div className="ice-penguin-celebration" aria-hidden="true"><img src={POLAR_ART.penguin} alt="" width="1254" height="1254"/><span>★</span></div>
        <div className="one-c-eyebrow">Week {lesson.week} · {lesson.title}</div><h1 ref={heading} tabIndex={-1}>Practice complete!</h1><p>{lesson.words.length} characters practiced. Star earned.</p>
        <p className="one-c-small">{completed} of {available.length} available activities complete</p>
        <div className="one-c-complete-actions"><button className="one-c-button primary" onClick={() => showMap(nextLessonId)}>Map →</button><button className="one-c-button secondary" onClick={() => startLesson(lesson)}>Again</button>{unlocked && <button className="one-c-button primary" onClick={startContinuous}>Continuous play →</button>}</div>
      </section>}
      <div className="one-c-notices" role="status">{audio.message && <p>{audio.message}</p>}{storageNotice && <p>{storageNotice}</p>}</div>
    </main><footer className="one-c-footer"><span>Grade 1C · Week {currentWeek} of {WEEKS.length}</span><a href="/">More Chinese games ↗</a></footer>
  </div></div>;
}
