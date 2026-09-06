import { useEffect, useRef, useState, type CSSProperties } from "react";
import { burstConfetti } from "../../lib/confetti";
import { playDing, playTada } from "../../lib/sfx";
import { LESSONS, NUMBERS, type Lesson, type Word } from "./curriculum";
import { makeReview, makeRound, parseProgress, PROGRESS_KEY, saveCompletion, type Progress, type Question } from "./game";
import { useLessonAudio } from "./useLessonAudio";

type Screen = "home" | "learn" | "play" | "complete";
type Run = { original: Question[]; questions: Question[]; index: number; reviewing: boolean; missed: string[]; firstTry: number };
const COLORS: Record<string, string> = { cyan: "#67e8f9", amber: "#fcd34d", green: "#6ee7b7", violet: "#c4b5fd", rose: "#fda4af" };

function SoundIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z" strokeLinejoin="round" /><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" strokeLinecap="round" /></svg>;
}

function TenFrame({ value, onCount }: { value: number; onCount?: (value: number) => void }) {
  const [counted, setCounted] = useState<number[]>([]);
  return <div className="one-c-counting">
    <div className="one-c-ten-frame" role="group" aria-label="Counting frame with ten spaces">
      {Array.from({ length: 10 }, (_, index) => index < value
        ? <button key={index} className={`one-c-counter ${counted.includes(index) ? "counted" : ""}`} aria-label={`Count dot ${index + 1}`} aria-pressed={counted.includes(index)} onClick={() => {
            setCounted((previous) => previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index]);
            onCount?.(index + 1);
          }}><span aria-hidden="true">{counted.includes(index) ? "✓" : ""}</span></button>
        : <span key={index} className="one-c-empty-counter" aria-hidden="true" />)}
    </div>
    <p className="one-c-small">{value === 0 ? "No dots. How many is that?" : "Tap each dot as you count."}</p>
  </div>;
}

function speechText(word: Word) { return word.example?.hanzi ?? word.hanzi; }

function readProgress(): Progress {
  try { return parseProgress(localStorage.getItem(PROGRESS_KEY), LESSONS); } catch { return {}; }
}

export default function Grade1CApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [learnIndex, setLearnIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [storageNotice, setStorageNotice] = useState("");
  const [run, setRun] = useState<Run | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"" | "wrong" | "correct">("");
  const [hint, setHint] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const audio = useLessonAudio();
  const learned = LESSONS.filter((item) => progress[item.id]).length;
  const nextLesson = LESSONS.find((item) => !progress[item.id]) ?? LESSONS[0];
  const word = lesson.words[learnIndex];
  const question = run?.questions[run.index];
  const accent = COLORS[lesson.color];

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [screen, learnIndex, run?.index, run?.reviewing]);

  useEffect(() => {
    if (feedback === "correct") nextButton.current?.focus({ preventScroll: true });
  }, [feedback]);

  function resetAnswer() {
    setWrong([]);
    setFeedback("");
    setHint(false);
    setSelectedTiles([]);
  }

  function home() { audio.stop(); setScreen("home"); setRun(null); resetAnswer(); }

  function startLesson(item: Lesson) {
    audio.stop();
    setLesson(item);
    setLearnIndex(0);
    setScreen("learn");
    setRun(null);
    resetAnswer();
    audio.play(speechText(item.words[0]));
  }

  function startGame() {
    const questions = makeRound(lesson, audio.canListen);
    setRun({ original: questions, questions, index: 0, reviewing: false, missed: [], firstTry: 0 });
    resetAnswer();
    setScreen("play");
    audio.stop();
  }

  function markMissed() {
    if (!question) return;
    setRun((current) => current && !current.reviewing && !current.missed.includes(question.word.id)
      ? { ...current, missed: [...current.missed, question.word.id] } : current);
  }

  function solved() {
    if (!question || feedback === "correct") return;
    if (!wrong.length && !hint) setRun((current) => current && !current.reviewing ? { ...current, firstTry: current.firstTry + 1 } : current);
    setFeedback("correct");
    if (audio.enabled) playDing();
    audio.play(speechText(question.word));
  }

  function answer(id: string) {
    if (!question || feedback === "correct") return;
    if (id === question.word.id) { solved(); return; }
    setWrong((previous) => previous.includes(id) ? previous : [...previous, id]);
    setFeedback("wrong");
    markMissed();
  }

  function checkSentence() {
    if (!question || feedback === "correct") return;
    const expected = question.word.example!.tokens;
    if (selectedTiles.length === expected.length && selectedTiles.every((tile, index) => question.tiles[tile] === expected[index])) { solved(); return; }
    setFeedback("wrong");
    setWrong(["sentence"]);
    markMissed();
  }

  function revealHint() { setHint(true); markMissed(); }

  function finish() {
    if (!run) return;
    const updated = saveCompletion(progress, lesson.id, run.firstTry / run.original.length);
    setProgress(updated);
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated)); }
    catch { setStorageNotice("Progress will last for this visit. This browser isn't allowing it to be saved."); }
    setScreen("complete");
    audio.stop();
    if (audio.enabled) playTada();
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) burstConfetti();
  }

  function advance() {
    if (!run || feedback !== "correct") return;
    audio.stop();
    resetAnswer();
    if (run.index + 1 < run.questions.length) {
      setRun({ ...run, index: run.index + 1 });
      return;
    }
    if (!run.reviewing && run.missed.length) {
      const review = makeReview(run.original, run.missed);
      setRun({ ...run, questions: review, index: 0, reviewing: true });
      return;
    }
    finish();
  }

  function listenButtons(text: string) {
    return <div className="one-c-audio-controls">
      <button className="one-c-button secondary" disabled={!audio.enabled} onClick={() => audio.play(text)}><SoundIcon /> Listen</button>
      <button className="one-c-button quiet" disabled={!audio.enabled} onClick={() => audio.play(text, "zh", true)}>Listen slowly</button>
    </div>;
  }

  function pronunciation(item: Word, useExample = false) {
    const content = useExample ? item.example ?? item : item;
    return <div className="one-c-word-answer">
      <div lang="zh-CN" className="one-c-answer-hanzi">{content.hanzi}</div>
      <div lang="zh-Latn-pinyin" className="one-c-pinyin">{content.pinyin}</div>
      <div>{content.english}</div>
    </div>;
  }

  const prompt = question?.mode === "build" ? "Build the sentence" : question?.mode === "count" ? "How many dots?" : question?.mode === "recognize" ? "Find the Chinese words" : question?.mode === "listen" ? "Listen. What does it mean?" : "What does this mean?";

  return <div className="one-c" style={{ "--lesson-accent": accent } as CSSProperties}>
    <div className="one-c-shell">
      <header className="one-c-header">
        <a className="one-c-brand" href="/">learncn<span>.fun</span></a>
        <div className="one-c-header-actions">
          {screen !== "home" && <button className="one-c-button quiet" onClick={home}>All activities</button>}
          <button className="one-c-sound-toggle" aria-label={audio.enabled ? "Turn sound off" : "Turn sound on"} aria-pressed={audio.enabled} onClick={audio.toggle}><SoundIcon /><span>Sound {audio.enabled ? "on" : "off"}</span></button>
        </div>
      </header>

      <main>
        {screen === "home" && <>
          <section className="one-c-welcome">
            <div className="one-c-eyebrow"><span className="one-c-class-badge">1C</span> Week 1A · September 1–4</div>
            <h1 ref={heading} tabIndex={-1}>My first<br /><span>school day.</span></h1>
            <p className="one-c-intro">A little Chinese. A little play. Let’s get to know our classroom.</p>
            <div className="one-c-start-row">
              <button className="one-c-button primary" onClick={() => startLesson(nextLesson)}>{learned === 0 ? "Let’s play" : learned === LESSONS.length ? "Play again" : "Keep learning"}<span aria-hidden="true">→</span></button>
              <span className="one-c-small">Learn it. Hear it. Try it.</span>
            </div>
            <div className="one-c-passport" aria-label={`${learned} of ${LESSONS.length} activity stars earned`}>
              <div className="one-c-passport-label"><strong>Your school-day stars</strong><span>{learned} / {LESSONS.length}</span></div>
              <div className="one-c-stars">{LESSONS.map((item) => <span key={item.id} className={progress[item.id] ? "earned" : ""} aria-label={`${item.title}: ${progress[item.id] ? "star earned" : "ready to play"}`}>★</span>)}</div>
            </div>
          </section>

          <section className="one-c-activities" aria-labelledby="activities-heading">
            <div className="one-c-section-title"><h2 id="activities-heading">Pick an adventure</h2><span className="one-c-small">Start anywhere</span></div>
            <div className="one-c-lesson-grid">{LESSONS.map((item, index) => <button key={item.id} className={`one-c-lesson ${progress[item.id] ? "completed" : ""}`} style={{ "--card-accent": COLORS[item.color] } as CSSProperties} onClick={() => startLesson(item)}>
              <div className="one-c-lesson-top"><span className="one-c-lesson-number">0{index + 1}</span><span className="one-c-lesson-status">{progress[item.id] ? "★ Star earned" : item.kind === "sentences" ? "3 sentences" : `${item.words.length} words`}</span></div>
              <div className="one-c-lesson-chinese" lang="zh-CN">{item.chinese}</div>
              <h3>{item.title}<span aria-hidden="true">↗</span></h3>
              <p>{item.description}</p>
            </button>)}</div>
          </section>
          <details className="one-c-family-note">
            <summary>For grown-ups · What we’re practicing</summary>
            <p>Based on the Grade 1C Week 1A newsletter (2026–27): all 12 words and all three sentence patterns from “Chinese Learning Point,” plus the number recognition within 10 described in Math.</p>
            <p>Learn the cards together, then play. Incorrect answers get a gentle retry and a short review. The numbers use a counting frame, numerals, and Chinese and English number words. Listening uses your device’s Mandarin voice; every audio question has a written hint.</p>
            <p>Stars are saved in this browser. Introductions use the example name Xiaoming and age six. Children can practice their own name and age out loud; the game does not ask for them.</p>
          </details>
        </>}

        {screen === "learn" && <section className="one-c-activity" aria-label={lesson.title}>
          <div className="one-c-activity-heading"><div><div className="one-c-eyebrow">{lesson.title} · Learn</div><h1 ref={heading} tabIndex={-1}>{lesson.kind === "sentences" ? "Let’s say it together." : "Meet your new words."}</h1></div><span className="one-c-step-count">{learnIndex + 1} / {lesson.words.length}</span></div>
          <progress className="one-c-progress" value={learnIndex + 1} max={lesson.words.length} aria-label="Teaching card progress" />
          <div className={`one-c-study-card ${lesson.kind === "sentences" ? "sentence" : ""}`}>
            {word.value === undefined && <span className="one-c-study-icon" aria-hidden="true">{word.icon}</span>}
            <div className="one-c-study-hanzi" lang="zh-CN">{word.value !== undefined && <span className="one-c-numeral">{word.value}</span>}{word.hanzi}</div>
            <div className="one-c-pinyin" lang="zh-Latn-pinyin">{word.pinyin}</div>
            <div className="one-c-study-english">{word.english}</div>
            {word.value !== undefined && <TenFrame key={word.id} value={word.value} onCount={(value) => audio.play(NUMBERS[value].hanzi)} />}
            {listenButtons(speechText(word))}
            {word.example && <div className="one-c-example"><span className="one-c-small">Try this example</span>{pronunciation(word, true)}</div>}
            <p className="one-c-tip">{word.tip}</p>
            <button className="one-c-text-button" disabled={!audio.enabled} onClick={() => audio.play(`${word.english.replaceAll("__", "blank")} ${word.tip}`, "en")}><SoundIcon /> Read this to me</button>
          </div>
          <div className="one-c-study-nav">
            <button className="one-c-button secondary" disabled={learnIndex === 0} onClick={() => { setLearnIndex(learnIndex - 1); audio.play(speechText(lesson.words[learnIndex - 1])); }}>Back</button>
            <button className="one-c-button primary" onClick={() => { if (learnIndex + 1 === lesson.words.length) startGame(); else { setLearnIndex(learnIndex + 1); audio.play(speechText(lesson.words[learnIndex + 1])); } }}>{learnIndex + 1 === lesson.words.length ? "Let’s play!" : "Next word"}<span aria-hidden="true">→</span></button>
          </div>
          <button className="one-c-text-button one-c-skip" onClick={startGame}>Know these already? Play now</button>
        </section>}

        {screen === "play" && run && question && <section className="one-c-activity">
          <div className="one-c-activity-heading"><div><div className="one-c-eyebrow">{lesson.title} · {run.reviewing ? "One more practice" : "Play"}</div><h1 ref={heading} tabIndex={-1}>{prompt}</h1></div><span className="one-c-step-count">{run.index + 1} / {run.questions.length}</span></div>
          <progress className="one-c-progress" value={run.index + (feedback === "correct" ? 1 : 0)} max={run.questions.length} aria-label={run.reviewing ? "Review progress" : "Game progress"} />
          {run.reviewing && <p className="one-c-review-note">Let’s try the words you needed a little help with.</p>}
          <div className="one-c-play-card">
            {question.mode === "meaning" && <div className="one-c-prompt-hanzi" lang="zh-CN">{question.word.hanzi}</div>}
            {question.mode === "recognize" && <div className="one-c-prompt-english">{question.word.english}</div>}
            {question.mode === "listen" && <div className="one-c-listen-prompt"><button className="one-c-big-listen" disabled={!audio.enabled} aria-label="Listen to the Chinese words" onClick={() => audio.play(question.word.hanzi)}><SoundIcon /></button><p>Tap to hear the Chinese words.</p><button className="one-c-text-button" disabled={!audio.enabled} onClick={() => audio.play(question.word.hanzi, "zh", true)}>Listen slowly</button></div>}
            {question.mode === "count" && <TenFrame key={question.id} value={question.word.value!} />}
            {question.mode === "build" && <p className="one-c-prompt-english">“{question.word.example!.english}”</p>}
            {question.mode !== "listen" && <button className="one-c-text-button one-c-read-prompt" disabled={!audio.enabled} onClick={() => audio.play(`${prompt}. ${question.mode === "build" ? question.word.example!.english : question.mode === "recognize" ? question.word.english : ""}`, "en")}><SoundIcon /> Hear the question</button>}

            {question.mode === "build" ? <>
              <p className="one-c-small">Tap the words in order. Tap a chosen word to put it back.</p>
              <div className="one-c-sentence-slot" role="group" aria-label="Your sentence">
                {selectedTiles.length === 0 && <span className="one-c-placeholder">Your sentence goes here</span>}
                {selectedTiles.map((tile, index) => <button key={tile} className="one-c-tile selected" lang="zh-CN" disabled={feedback === "correct"} aria-label={`Remove ${question.tiles[tile]} from position ${index + 1}`} onClick={() => { setSelectedTiles(selectedTiles.filter((_, selectedIndex) => selectedIndex !== index)); setFeedback(""); }}>{question.tiles[tile]}</button>)}
              </div>
              <div className="one-c-tile-bank" role="group" aria-label="Available words">{question.tiles.map((tile, index) => <button key={index} lang="zh-CN" className="one-c-tile" disabled={selectedTiles.includes(index) || feedback === "correct"} onClick={() => { setSelectedTiles([...selectedTiles, index]); setFeedback(""); }}>{tile}</button>)}</div>
              <button className="one-c-button secondary one-c-check" disabled={selectedTiles.length !== question.tiles.length || feedback === "correct"} onClick={checkSentence}>Check sentence</button>
            </> : <div className="one-c-options" role="group" aria-label="Answer choices">{question.options.map((option) => {
              const chinese = question.mode === "recognize" || question.mode === "count";
              const isWrong = wrong.includes(option.id);
              const isCorrect = feedback === "correct" && option.id === question.word.id;
              return <div key={option.id} className={`one-c-option-row ${isWrong ? "wrong" : ""} ${isCorrect ? "correct" : ""}`}>
                <button className={`one-c-option ${chinese ? "chinese" : ""}`} disabled={isWrong || feedback === "correct"} onClick={() => answer(option.id)}>
                  {!chinese && <span className="one-c-option-icon" aria-hidden="true">{option.icon}</span>}
                  <span lang={chinese ? "zh-CN" : "en"}>{chinese ? option.hanzi : option.english}</span>
                  {isWrong && <span className="one-c-choice-state">Try again</span>}{isCorrect && <span className="one-c-choice-state">✓ Correct</span>}
                </button>
                {!chinese && <button className="one-c-option-audio" aria-label={`Hear option: ${option.english}`} disabled={!audio.enabled} onClick={() => audio.play(option.english, "en")}><SoundIcon /></button>}
              </div>;
            })}</div>}

            {feedback !== "correct" && <div className="one-c-hint">
              {!hint ? <button className="one-c-text-button" onClick={revealHint}>{question.mode === "listen" ? "Show the word" : "Need a hint?"}</button> : <div>{pronunciation(question.word, question.mode === "build")}{listenButtons(speechText(question.word))}</div>}
              {question.mode === "listen" && (!audio.canListen || audio.message) && !hint && <p className="one-c-small">No audio? Tap “Show the word” to keep playing.</p>}
            </div>}
          </div>
          <div className={`one-c-feedback ${feedback}`} aria-live="polite" aria-atomic="true">
            {feedback === "wrong" && <p>{question.mode === "build" ? "Almost! Try another order. You can use a hint." : "Good try! Choose another answer, or take a hint."}</p>}
            {feedback === "correct" && <>
              <div><strong>太棒了！ Great work!</strong>{pronunciation(question.word, question.mode === "build")}</div>
              <button className="one-c-button primary" ref={nextButton} onClick={advance}>{run.index + 1 === run.questions.length ? !run.reviewing && run.missed.length ? "Practice tricky words" : "Collect your star" : "Next"}<span aria-hidden="true">→</span></button>
            </>}
          </div>
        </section>}

        {screen === "complete" && run && <section className="one-c-complete">
          <div className="one-c-earned-star" aria-hidden="true">★</div>
          <div className="one-c-eyebrow">{lesson.title} · Star earned</div>
          <h1 ref={heading} tabIndex={-1}>You did it!</h1>
          <p>You practiced {lesson.kind === "sentences" ? "three whole sentences" : `${lesson.words.length} ${lesson.kind === "numbers" ? "numbers" : "Chinese words"}`}.</p>
          {run.missed.length > 0 && <p className="one-c-small">And you gave the tricky ones another go. That’s how we learn!</p>}
          <div className="one-c-stars">{LESSONS.map((item) => <span key={item.id} className={progress[item.id] ? "earned" : ""} aria-label={`${item.title}: ${progress[item.id] ? "star earned" : "not yet completed"}`}>★</span>)}</div>
          <p className="one-c-small">{learned === LESSONS.length ? "All five stars! Your school day is complete." : `${learned} of ${LESSONS.length} school-day stars`}</p>
          <div className="one-c-complete-actions"><button className="one-c-button primary" onClick={() => learned === LESSONS.length ? home() : startLesson(nextLesson)}>{learned === LESSONS.length ? "Choose an activity" : "Next adventure"}<span aria-hidden="true">→</span></button><button className="one-c-button secondary" onClick={startGame}>Play this again</button></div>
          <details className="one-c-practiced"><summary>Practice your words again</summary>{lesson.words.map((item) => <button className="one-c-review-word" key={item.id} disabled={!audio.enabled} onClick={() => audio.play(speechText(item))}>{pronunciation(item)}<SoundIcon /></button>)}</details>
        </section>}
        <div className="one-c-notices" role="status">{audio.message && <p>{audio.message}</p>}{storageNotice && <p>{storageNotice}</p>}</div>
      </main>
      <footer className="one-c-footer"><span>Grade 1C · Week 1 · I go to school</span><a href="/">More Chinese games ↗</a></footer>
    </div>
  </div>;
}
