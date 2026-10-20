import { useEffect, useRef, useState, type CSSProperties } from "react";
import { burstConfetti } from "../../lib/confetti";
import { playDing, playPop, playTada } from "../../lib/sfx";
import type { Lesson, Word } from "./curriculum";
import { LESSONS, WEEKS, availableLessons, currentSchoolWeek } from "./weekly-curriculum";
import { makeReview, PROGRESS_KEY, saveCompletion, type Progress, type Question } from "./game";
import { activityComplete, choosePractice, continuousUnlocked, parseWordHistory, PRACTICE_PROGRESS_KEY, practiceRound, practiceQuestion, readPracticeProgress, recordResult, skillFor, wordKey, WORD_HISTORY_KEY, type WordHistory } from "./practice";
import { useLessonAudio } from "./useLessonAudio";
import PenguinPath from "./PenguinPath";
import { POLAR_ART, nextIceLesson } from "./ice-path";
import TraceCharacter, { type WritingAttempt, type WritingMode } from "./TraceCharacter";
import StrokesApp from "../strokes/StrokesApp";
import { PwaInstallPrompt } from "../../components/PwaInstall";
import TrophyCase, { TrophyIcon } from "./TrophyCase";

type Screen = "home" | "play" | "complete" | "strokes" | "trophies";
// Share the main Read game's preference, including its default of CN/pinyin.
const ANSWER_MODE_KEY = "learncn.read.answerMode";
const READING_PROMPT = "这是什么字？";
type Run = { original: Question[]; questions: Question[]; index: number; reviewing: boolean; missed: string[]; firstTry: number; continuous: boolean; practiced: number; written: string[] };
function stored(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
function SoundIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z" strokeLinejoin="round"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" strokeLinecap="round"/></svg>; }

export default function Grade1CApp() {
  const [currentWeek, setCurrentWeek] = useState(currentSchoolWeek);
  const [screen, setScreen] = useState<Screen>("home");
  const [answerMode, setAnswerMode] = useState<"cn" | "en">(() => ["cn", "chinese", "pinyin"].includes((stored(ANSWER_MODE_KEY) ?? "cn").trim().toLowerCase()) ? "cn" : "en");
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [progress, setProgress] = useState<Progress>(() => readPracticeProgress(stored(PRACTICE_PROGRESS_KEY), stored(PROGRESS_KEY)));
  const [history, setHistory] = useState<WordHistory>(() => parseWordHistory(stored(WORD_HISTORY_KEY)));
  const historyRef = useRef(history);
  const [mapPosition, setMapPosition] = useState(() => { const id = nextIceLesson(progress, undefined, currentWeek); return { from: id, to: id }; });
  const [run, setRun] = useState<Run | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"" | "wrong" | "correct">("");
  const [hint, setHint] = useState(false);
  const [writingMode, setWritingMode] = useState<WritingMode>("guided");
  const [writingAttempt, setWritingAttempt] = useState(0);
  const [writingAction, setWritingAction] = useState<"recall" | "retry" | null>(null);
  const writingHadHelp = useRef(false);
  const writingAttemptHelp = useRef(false);
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
  const readingActive = screen === "play" && question?.mode === "meaning";
  const writingComplete = screen === "play" && question?.mode === "trace" && (feedback === "correct" || writingAction !== null);
  const available = availableLessons(currentWeek);
  const completed = available.filter(item => activityComplete(item, progress)).length;
  const unlocked = continuousUnlocked(progress, currentWeek);
  const continuousHelp = unlocked ? "Read and write, with extra practice for tricky characters." : `Complete Read and Write in weeks 1–${currentWeek || 1} to unlock. ${completed} / ${available.length} activities complete.`;
  const needsWritingCheck = available.some(item => item.kind === "writing" && progress[item.id] && !activityComplete(item, progress));
  const nextLessonId = nextIceLesson(progress, lesson.id, currentWeek);

  useEffect(() => {
    const refresh = () => setCurrentWeek(currentSchoolWeek());
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [screen, question?.id]);
  useEffect(() => { if (screen !== "home") window.scrollTo(0, 0); }, [screen]);
  useEffect(() => { if (feedback === "correct" || writingAction) nextButton.current?.focus({ preventScroll: true }); }, [feedback, writingAction]);
  useEffect(() => {
    if (readingActive && audio.enabled) audio.play(READING_PROMPT, "zh");
  }, [readingActive, question?.id, audio.enabled, audio.play]);

  function save(key: string, value: unknown) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { setStorageNotice("Progress lasts for this visit. This browser isn't allowing it to be saved."); }
  }
  function toggleAnswers() {
    const mode = answerMode === "cn" ? "en" : "cn";
    setAnswerMode(mode);
    try { localStorage.setItem(ANSWER_MODE_KEY, mode); }
    catch { setStorageNotice("Your answer preference lasts for this visit."); }
  }
  function resetAnswer(mode: WritingMode = "guided") {
    setWrong([]); setFeedback(""); setHint(false); setWritingMode(mode); setWritingAttempt(0); setWritingAction(null);
    recorded.current = false; solvedOnce.current = false; writingHadHelp.current = false; writingAttemptHelp.current = false;
  }
  function beginRecall() {
    audio.stop(); setWritingMode("recall"); setWritingAttempt(attempt => attempt + 1); setWritingAction(null);
    setFeedback(""); setHint(false); recorded.current = false; solvedOnce.current = false; writingAttemptHelp.current = false;
    heading.current?.focus({ preventScroll: true });
  }
  function completeWriting(result: WritingAttempt) {
    if (writingMode === "recall" && !result.assisted && !writingAttemptHelp.current) { solved(result.lastStrokeName); return; }
    if (writingMode === "recall") { markMissed("hint"); setHint(true); }
    setWritingAction(writingMode === "guided" ? "recall" : "retry");
    audio.narrate([...(result.lastStrokeName ? [{ text: result.lastStrokeName, language: "zh" as const }] : []), { text: question!.word.hanzi, language: "zh" }]);
  }
  function showMap(destination = lesson.id) {
    audio.stop(); setMapPosition({ from: lesson.id, to: destination }); setScreen("home"); setRun(null); resetAnswer();
  }
  function readQuestion(item: Question) {
    // Reading uses the short question cue above; writing says its target.
    if (item.mode === "trace") audio.play(item.word.hanzi);
  }
  function startLesson(item: Lesson) {
    if (item.week > currentSchoolWeek()) return;
    audio.stop(); setNotice(""); setLesson(item); resetAnswer();
    const questions = practiceRound(item);
    setRun({ original: questions, questions, index: 0, reviewing: false, missed: [], firstTry: 0, continuous: false, practiced: 0, written: [] });
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
    audio.stop(); resetAnswer("recall"); setLesson(item.lesson);
    setRun({ original: [q], questions: [q], index: 0, reviewing: false, missed: [], firstTry: 0, continuous: true, practiced, written: [] });
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
    if (question.mode === "trace") { writingHadHelp.current = true; writingAttemptHelp.current = true; return; }
    setRun(current => current && !current.reviewing && !current.missed.includes(question.word.id) ? { ...current, missed: [...current.missed, question.word.id] } : current);
  }
  function solved(lastStrokeName?: string) {
    if (!question || solvedOnce.current) return;
    solvedOnce.current = true;
    record("correct");
    setRun(current => current ? {
      ...current,
      written: question.mode === "trace" ? [...new Set([...current.written, question.word.id])] : current.written,
      firstTry: current.firstTry + Number(!current.reviewing && !wrong.length && !hint && !writingHadHelp.current),
    } : current);
    setFeedback("correct"); if (audio.enabled) playDing();
    audio.narrate([...(lastStrokeName ? [{ text: lastStrokeName, language: "zh" as const }] : []), { text: question.word.hanzi, language: "zh" }]);
  }
  function answer(id: string) {
    if (!question || solvedOnce.current) return;
    if (id === question.word.id) { solved(); return; }
    setWrong(previous => [...new Set([...previous, id])]); setFeedback("wrong");
    if (audio.enabled) playPop();
    markMissed("miss");
  }
  function finish() {
    if (!run || (lesson.kind === "writing" && !run.original.every(q => run.written.includes(q.word.id)))) return;
    const updated = saveCompletion(progress, lesson.id, run.firstTry / run.original.length);
    if (lesson.kind === "writing") updated[lesson.id].handwritingVerified = true;
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
  function listen(word: Word) {
    const english = readingActive && answerMode === "cn";
    audio.play(english ? word.english : word.hanzi, english ? "en" : "zh");
  }
  if (screen === "strokes") return <StrokesApp homeLabel="Map" initialAudio={audio.enabled} onHome={() => setScreen("home")} />;

  return <div className={`one-c ${writingComplete ? "one-c-writing-complete" : ""} ${readingActive ? "one-c-reading" : ""}`} style={{ "--lesson-accent": lesson.kind === "writing" ? "#6ee7b7" : "#67e8f9" } as CSSProperties}><div className="one-c-shell">
    <header className="one-c-header"><a className="one-c-brand" href="/">learncn<span>.fun</span></a><div className="one-c-header-actions">
      {screen === "home" && <><button className="one-c-continuous-button" aria-label="Continuous play" aria-describedby="continuous-help" title={continuousHelp} disabled={!unlocked} onClick={startContinuous}><span aria-hidden="true">{unlocked ? "∞" : "🔒"}</span>Continuous play</button><span id="continuous-help" hidden>{continuousHelp}</span></>}
      {screen === "home" && <button className="one-c-trophy-button" aria-label="Open trophy case" title="Trophy case" onClick={() => { audio.stop(); setScreen("trophies"); }}><TrophyIcon/></button>}
      {screen !== "home" && <button className="one-c-button quiet" aria-label={run?.continuous ? "End continuous practice" : "Back to the ice path"} onClick={() => { if (run?.continuous) setNotice(`${run.practiced + Number(feedback === "correct")} characters practiced.`); showMap(); }}>{run?.continuous ? "End practice" : "Map"}</button>}
      <button className="one-c-sound-toggle" aria-label={audio.enabled ? "Turn sound off" : "Turn sound on"} aria-pressed={audio.enabled} onClick={audio.toggle}><SoundIcon/><span>Sound</span></button>
    </div></header>
    <main>
      {screen === "home" && <><PwaInstallPrompt/>
        {notice && <p role="status" className="one-c-review-note">{notice}</p>}
        {needsWritingCheck && <p className="one-c-review-note">Writing stars now need a full attempt without hints. Your earlier practice is saved.</p>}
        <PenguinPath currentWeek={currentWeek} progress={progress} initialLessonId={mapPosition.from} destinationLessonId={mapPosition.to} onStart={startLesson} headingRef={heading}/>
        <div className="one-c-audio-controls"><button className="one-c-button secondary" onClick={() => { audio.stop(); setScreen("strokes"); }}>✏️ Learn strokes · 笔画</button></div>

        <details className="one-c-family-note"><summary>For grown-ups</summary><p>19 weeks, with separate reading and writing lists from the full Grade 1 character sheet. Each chapter maps to the same numbered week. Weeks open on Mondays, using the September 1, 2026 school start and Pacific time.</p><p>Practice starts immediately. Mistakes and hints give characters more weight in continuous play; successful practice gradually reduces that extra weight. Reading and handwriting are tracked separately. Only available weeks enter the practice pool.</p><p>Progress and word history stay in this browser. Earlier reading stars are carried over where they cover a whole new activity. Writing stars require every character to be written without hints; earlier tracing records are retained. No microphone or account is needed.</p></details>
      </>}
      {screen === "trophies" && <TrophyCase history={history} currentWeek={currentWeek} headingRef={heading}/>}
      {screen === "play" && run && question && <section className="one-c-activity">
        <div className="one-c-activity-heading"><div><div className="one-c-eyebrow">{run.continuous ? "Continuous play" : `Week ${lesson.week}`} · {skillFor(lesson) === "write" ? "Write" : "Read"}{run.reviewing ? " · Review" : ""}</div><h1 ref={heading} tabIndex={-1}>{question.mode === "trace" ? writingMode === "guided" ? "Trace the character" : "Write it on your own" : answerMode === "cn" ? "How do you read this?" : "What does this mean?"}</h1></div><span className="one-c-step-count">{run.continuous ? `${run.practiced} practiced` : `${run.index + 1} / ${run.questions.length}`}</span></div>
        {!run.continuous && <progress className="one-c-progress" value={run.index + Number(feedback === "correct")} max={run.questions.length} aria-label={run.reviewing ? "Review progress" : "Practice progress"}/>}
        <div className="one-c-play-card">
          {question.mode === "meaning" ? <div className="one-c-prompt-hanzi" lang="zh-CN">{question.word.hanzi}</div> : <><div className="one-c-prompt-english">{question.word.english}</div><div className="one-c-pinyin" lang="zh-Latn-pinyin">{question.word.pinyin}</div></>}
          <div className="one-c-audio-controls"><button className="one-c-button secondary" disabled={!audio.enabled} onClick={() => listen(question.word)}><SoundIcon/> Listen</button></div>
          {question.mode === "trace" && <TraceCharacter key={`${question.id}-${writingAttempt}`} hanzi={question.word.hanzi} mode={writingMode} onStrokeName={name => audio.play(name)} onComplete={completeWriting} onHelp={kind => { markMissed(kind); setHint(true); }}/>}
          {(question.mode !== "trace") && <div className="one-c-options reading-choices" role="group" aria-label="Answer choices">{question.options.map(option => <button key={option.id} className={`one-c-option ${wrong.includes(option.id) ? "wrong" : ""}`} disabled={wrong.includes(option.id) || feedback === "correct"} onClick={() => answer(option.id)}><span className="one-c-option-icon" aria-hidden="true">{option.icon}</span><span className="one-c-option-label" lang={answerMode === "cn" ? "zh-Latn-pinyin" : "en"}>{answerMode === "cn" ? option.pinyin : option.english}</span></button>)}</div>}
          {feedback !== "correct" && question.mode !== "trace" && <div className="one-c-hint">{hint ? detail(question.word) : <button className="one-c-text-button" onClick={() => { setHint(true); markMissed("hint"); }}>Hint</button>}</div>}
        </div>
        <div className={`one-c-feedback ${writingComplete ? "correct" : feedback} ${writingComplete ? "one-c-writing-feedback" : ""}`} aria-live="polite" aria-atomic="true">
          {feedback === "wrong" && <p>Try again.</p>}
          {writingAction && <><span className="one-c-writing-success">{writingAction === "recall" ? "Trace complete" : "One more try"}</span><button className="one-c-button primary" ref={nextButton} onClick={beginRecall}>{writingAction === "recall" ? "Your turn" : "Try again"} →</button></>}
          {feedback === "correct" && <>{writingComplete ? <span className="one-c-writing-success"><span aria-hidden="true">✓</span>You wrote it!</span> : <div><strong>✓</strong>{detail(question.word)}</div>}<button className="one-c-button primary" ref={nextButton} aria-label={run.continuous ? "Next practice question" : "Next question"} onClick={advance}>{run.continuous || run.index + 1 < run.questions.length ? "Next" : !run.reviewing && run.missed.length ? "Review" : "Done"} →</button></>}
        </div>
      </section>}
      {screen === "complete" && run && <section className="one-c-complete">
        <div className="ice-penguin-celebration" aria-hidden="true"><img src={POLAR_ART.penguin} alt="" width="1254" height="1254"/><span>★</span></div>
        <div className="one-c-eyebrow">Week {lesson.week} · {lesson.title}</div><h1 ref={heading} tabIndex={-1}>Practice complete!</h1><p>{lesson.words.length} characters practiced. Star earned.</p>
        <p className="one-c-small">{completed} of {available.length} available activities complete</p>
        <div className="one-c-complete-actions"><button className="one-c-button secondary" onClick={() => startLesson(lesson)}>Again</button><button className="one-c-button primary" onClick={() => showMap(nextLessonId)}>Next →</button>{unlocked && <button className="one-c-button primary" onClick={startContinuous}>Continuous play →</button>}</div>
      </section>}
      <div className="one-c-notices" role="status">{audio.message && <p>{audio.message}</p>}{storageNotice && <p>{storageNotice}</p>}</div>
    </main><footer className="one-c-footer"><span>Grade 1C · Week {currentWeek} of {WEEKS.length}</span><a href="/">More Chinese games ↗</a></footer>
    {readingActive && <button className="one-c-answer-mode" aria-pressed={answerMode === "cn"} title="CN: pinyin · EN: English" onClick={toggleAnswers}><span aria-hidden="true"/>Answers {answerMode === "cn" ? "CN" : "EN"}</button>}
  </div></div>;
}
