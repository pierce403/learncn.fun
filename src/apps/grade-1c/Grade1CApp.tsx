import { useEffect, useRef, useState, type CSSProperties } from "react";
import { burstConfetti } from "../../lib/confetti";
import { playDing, playTada } from "../../lib/sfx";
import { COMPARISONS, LESSONS, NUMBERS, WEEKS, practiceSpeech, type Lesson, type Word } from "./curriculum";
import { makeReview, makeRound, parseProgress, PROGRESS_KEY, questionSpeech, saveCompletion, type Progress, type Question } from "./game";
import { useLessonAudio } from "./useLessonAudio";
import PenguinPath from "./PenguinPath";
import { POLAR_ART, nextIceLesson } from "./ice-path";
import TraceCharacter from "./TraceCharacter";
import { CompareScene, NumberSequence } from "./NumberScenes";
import { INSTRUCTION_LANGUAGE_KEY, parseInstructionLanguage, type InstructionLanguage, comparisonHintNarration, cardNarration, lessonNarration, questionNarration, spokenText } from "./narration";

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

const speechText = practiceSpeech;

function readProgress(): Progress {
  try { return parseProgress(localStorage.getItem(PROGRESS_KEY), LESSONS); } catch { return {}; }
}

export default function Grade1CApp() {
  const [instructionLanguage, setInstructionLanguage] = useState<InstructionLanguage>(() => {
    try { return parseInstructionLanguage(localStorage.getItem(INSTRUCTION_LANGUAGE_KEY)); }
    catch { return "en"; }
  });
  const [screen, setScreen] = useState<Screen>("home");
  const [lesson, setLesson] = useState<Lesson>(LESSONS[0]);
  const [learnIndex, setLearnIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [mapPosition, setMapPosition] = useState(() => {
    const id = nextIceLesson(progress);
    return { from: id, to: id };
  });
  const [storageNotice, setStorageNotice] = useState("");
  const [run, setRun] = useState<Run | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"" | "wrong" | "correct">("");
  const [hint, setHint] = useState(false);
  const [traceFallback, setTraceFallback] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const audio = useLessonAudio();
  const learned = LESSONS.filter((item) => progress[item.id]).length;
  const nextLesson = LESSONS.find((item) => item.id === nextIceLesson(progress, lesson.id))!;
  const week = WEEKS.find((item) => item.number === lesson.week)!;
  const word = lesson.words[learnIndex];
  const studyWord = word.example ?? word;
  const question = run?.questions[run.index];
  const isSentence = lesson.kind === "sentences";
  const isSound = lesson.kind === "sounds";
  const isListening = question?.mode === "listen" || question?.mode === "sound";
  const showSentenceText = isSentence && (question?.mode === "meaning" || !audio.canListen || Boolean(audio.message));
  const accent = COLORS[lesson.color];

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [screen, learnIndex, run?.index, run?.reviewing]);

  useEffect(() => {
    if (screen !== "home") window.scrollTo(0, 0);
  }, [screen]);

  useEffect(() => {
    if (feedback === "correct") nextButton.current?.focus({ preventScroll: true });
  }, [feedback]);

  useEffect(() => {
    try { localStorage.setItem(INSTRUCTION_LANGUAGE_KEY, instructionLanguage); }
    catch { /* The current choice still works when storage is unavailable. */ }
  }, [instructionLanguage]);

  function chooseInstructionLanguage(language: InstructionLanguage) {
    if (language === instructionLanguage) return;
    audio.stop();
    setInstructionLanguage(language);
    if (screen === "learn") audio.narrate(lessonNarration(lesson, word, language));
    else if (screen === "play" && question) audio.narrate(questionNarration(lesson, question, traceFallback, true, language));
    else audio.play(language === "zh" ? "中文说明。" : "English directions.", language);
  }

  function resetAnswer() {
    setWrong([]);
    setFeedback("");
    setHint(false);
    setTraceFallback(false);
  }

  function showMap(destination = lesson.id) {
    audio.stop();
    setMapPosition({ from: lesson.id, to: destination });
    setScreen("home");
    setRun(null);
    resetAnswer();
  }

  function home() { showMap(); }

  function startLesson(item: Lesson) {
    audio.stop();
    setLesson(item);
    setLearnIndex(0);
    setScreen("learn");
    setRun(null);
    resetAnswer();
    audio.narrate(lessonNarration(item, item.words[0], instructionLanguage));
  }

  function startGame() {
    const questions = makeRound(lesson, audio.canListen);
    setRun({ original: questions, questions, index: 0, reviewing: false, missed: [], firstTry: 0 });
    resetAnswer();
    setScreen("play");
    audio.stop();
    readQuestion(questions[0], true);
  }

  function readQuestion(item: Question, fullDirections = false) {
    audio.narrate(questionNarration(lesson, item, false, fullDirections, instructionLanguage));
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
    audio.play(questionSpeech(question));
  }

  function answer(id: string) {
    if (!question || feedback === "correct") return;
    if (id === question.word.id) { solved(); return; }
    setWrong((previous) => previous.includes(id) ? previous : [...previous, id]);
    setFeedback("wrong");
    markMissed();
    audio.play(instructionLanguage === "zh" ? "再试试！选另一个答案。" : "Good try! Tap another answer.", instructionLanguage);
  }

  function revealHint() {
    setHint(true);
    markMissed();
    if (question?.mode === "compare") audio.narrate(comparisonHintNarration());
  }

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
      readQuestion(run.questions[run.index + 1]);
      return;
    }
    if (!run.reviewing && run.missed.length) {
      const review = makeReview(run.original, run.missed);
      setRun({ ...run, questions: review, index: 0, reviewing: true });
      readQuestion(review[0]);
      return;
    }
    finish();
  }

  function listenButtons(text: string) {
    return <div className="one-c-audio-controls">
      <button className="one-c-button secondary" disabled={!audio.enabled} onClick={() => audio.play(text)}><SoundIcon /> Listen</button>
      <button className="one-c-button quiet" disabled={!audio.enabled} aria-label="Listen slowly" onClick={() => audio.play(text, "zh", true)}>Slow</button>
    </div>;
  }

  function pronunciation(item: Word, useExample = false) {
    const content = useExample ? item.example ?? item : item;
    return <div className="one-c-word-answer">
      <div lang={item.soundCue ? "zh-Latn-pinyin" : "zh-CN"} className="one-c-answer-hanzi">{content.hanzi}</div>
      <div className="one-c-pinyin">{item.soundCue && "Hear: "}<span lang="zh-Latn-pinyin">{content.pinyin}</span></div>
      <div>{content.english}</div>
    </div>;
  }

  function questionDetails(item: Question) {
    return <>{item.pair && <div className="one-c-answer-hanzi">{item.pair[0]} {item.word.hanzi} {item.pair[1]}</div>}
      {item.sequence && <NumberSequence values={item.sequence} answer={item.word.value} />}
      {pronunciation(item.word, isSentence)}</>;
  }

  const prompt = isSentence ? showSentenceText ? "What does this mean?" : "Listen and tap"
    : isSound ? question?.mode === "sound-read" || !audio.canListen || audio.message ? "Find the sound" : "Listen and tap the sound"
    : question?.mode === "trace" ? traceFallback ? "Find the character" : "Trace with me"
    : question?.mode === "compare" ? "More, less, or the same?"
    : question?.mode === "order" ? "What number is missing?"
    : question?.mode === "count" ? "How many dots?" : question?.mode === "recognize" ? "Find the Chinese words" : question?.mode === "listen" ? "Listen. What does it mean?" : "What does this mean?";
  const hintLabel = isSentence ? "Show the sentence" : isSound ? "Show the sound" : "Show the word";

  return <div className="one-c" style={{ "--lesson-accent": accent } as CSSProperties}>
    <div className="one-c-shell">
      <header className="one-c-header">
        <a className="one-c-brand" href="/">learncn<span>.fun</span></a>
        <div className="one-c-header-actions">
          <div className="one-c-language-setting">
            <span lang={instructionLanguage === "zh" ? "zh-CN" : "en"}>{instructionLanguage === "zh" ? "说明" : "Directions"}</span>
            <div className="one-c-language-toggle" role="group" aria-label="Spoken instruction language">
              <button lang="en-US" aria-label="English instructions" aria-pressed={instructionLanguage === "en"} onClick={() => chooseInstructionLanguage("en")}>English</button>
              <button lang="zh-CN" aria-label="Mandarin instructions" aria-pressed={instructionLanguage === "zh"} onClick={() => chooseInstructionLanguage("zh")}>中文</button>
            </div>
          </div>
          {screen !== "home" && <button className="one-c-button quiet" aria-label="Back to the ice path" onClick={home}>Map</button>}
          <button className="one-c-sound-toggle" aria-label={audio.enabled ? "Turn sound off" : "Turn sound on"} aria-pressed={audio.enabled} onClick={audio.toggle}><SoundIcon /><span>Sound</span></button>
        </div>
      </header>

      <main>
        {screen === "home" && <>
          <PenguinPath progress={progress} initialLessonId={mapPosition.from} destinationLessonId={mapPosition.to} onStart={startLesson} headingRef={heading} />
          <details className="one-c-family-note">
            <summary>For grown-ups · What we’re practicing</summary>
            <p>Based on the Grade 1C newsletters (2026–27). Week 1: school words, greetings, introductions, and numbers 0–10. Week 2: pinyin finals a, o, e, i, u, ü, er; initials y and w; recognizing 衣、鱼、雨、耳、牙; writing 一、二、五、口、人; and comparing and ordering numbers within 10.</p>
            <p>Learn the cards together, then play. Incorrect answers get a gentle retry and a short review. The numbers use a counting frame, numerals, and Chinese and English number words. Listening uses your device’s Mandarin voice; every audio question has a written hint.</p>
            <p>Stars are saved in this browser. Introductions use the example name Xiaoming and age six. Children can practice their own name and age out loud; the game does not ask for them.</p>
            <p>Pinyin audio uses example syllables in a Mandarin voice. The ü sound keeps its dots in nǚ; after y, its dots disappear, as in yú (鱼) and yǔ (雨). Open “Words” on a character card for the newsletter’s word combinations and example sentence.</p>
          </details>
        </>}

        {screen === "learn" && <section className="one-c-activity" aria-label={lesson.title}>
          <div className="one-c-activity-heading"><div><div className="one-c-eyebrow">Week {lesson.week} · {lesson.title} · Learn</div><h1 ref={heading} tabIndex={-1}>{isSentence ? "Let’s say it together." : isSound ? "Meet your new sounds." : lesson.kind === "compare" || lesson.kind === "order" ? "Let’s try it together." : "Meet your new words."}</h1></div><span className="one-c-step-count">{learnIndex + 1} / {lesson.words.length}</span></div>
          <button className="one-c-text-button one-c-help-button" aria-label="Hear directions" title="Hear directions" disabled={!audio.enabled} onClick={() => audio.narrate(lessonNarration(lesson, word, instructionLanguage))}><span aria-hidden="true">?</span></button>
          <progress className="one-c-progress" value={learnIndex + 1} max={lesson.words.length} aria-label="Teaching card progress" />
          <div className={`one-c-study-card ${lesson.kind === "sentences" ? "sentence" : ""}`}>
            {word.value === undefined && <span className="one-c-study-icon" aria-hidden="true">{word.icon}</span>}
            {word.pair ? <CompareScene pair={word.pair} sign={word.hanzi} /> : word.sequence ? <NumberSequence values={word.sequence} /> : <div className="one-c-study-hanzi" lang={isSound ? "zh-Latn-pinyin" : "zh-CN"}>{word.value !== undefined && <span className="one-c-numeral">{word.value}</span>}{studyWord.hanzi}</div>}
            <div className="one-c-pinyin">{isSound && "Hear: "}<span lang="zh-Latn-pinyin">{studyWord.pinyin}</span></div>
            <div className="one-c-study-english">{studyWord.english}</div>
            {word.value !== undefined && <TenFrame key={word.id} value={word.value} onCount={(value) => audio.play(NUMBERS[value].hanzi)} />}
            {listenButtons(speechText(word))}
            <p className="one-c-tip">{word.tip}</p>
            <button className="one-c-text-button" disabled={!audio.enabled} aria-label="Read this to me" onClick={() => audio.narrate(cardNarration(word, true, instructionLanguage))}><SoundIcon /> Read</button>
            {word.related && <details className="one-c-related" key={word.id}><summary>Words</summary>
              {word.related.map((item) => <button key={item.hanzi} className="one-c-review-word" disabled={!audio.enabled} onClick={() => audio.play(item.hanzi)}><span><span lang="zh-CN">{item.hanzi}</span> · <span lang="zh-Latn-pinyin">{item.pinyin}</span><br />{item.english}</span><SoundIcon /></button>)}
              {word.sentence && <button className="one-c-review-word" disabled={!audio.enabled} onClick={() => audio.play(word.sentence!.hanzi)}><span><span lang="zh-CN">{word.sentence.hanzi}</span><br /><span lang="zh-Latn-pinyin">{word.sentence.pinyin}</span><br />{word.sentence.english}</span><SoundIcon /></button>}
            </details>}
          </div>
          <div className="one-c-study-nav">
            <button className="one-c-button secondary" disabled={learnIndex === 0} onClick={() => { setLearnIndex(learnIndex - 1); audio.narrate(cardNarration(lesson.words[learnIndex - 1], false, instructionLanguage)); }}>Back</button>
            <button className="one-c-button primary" onClick={() => { if (learnIndex + 1 === lesson.words.length) startGame(); else { setLearnIndex(learnIndex + 1); audio.narrate(cardNarration(lesson.words[learnIndex + 1], false, instructionLanguage)); } }}>{learnIndex + 1 === lesson.words.length ? "Play" : "Next"}<span aria-hidden="true">→</span></button>
          </div>
          <button className="one-c-text-button one-c-skip" aria-label="Skip learning cards and play" onClick={startGame}>Skip</button>
        </section>}

        {screen === "play" && run && question && <section className="one-c-activity">
          <div className="one-c-activity-heading"><div><div className="one-c-eyebrow">Week {lesson.week} · {lesson.title} · {run.reviewing ? "One more practice" : "Play"}</div><h1 ref={heading} tabIndex={-1}>{prompt}</h1></div><span className="one-c-step-count">{run.index + 1} / {run.questions.length}</span></div>
          <button className="one-c-text-button one-c-help-button" aria-label="Hear directions" title="Hear directions" disabled={!audio.enabled} onClick={() => audio.narrate(questionNarration(lesson, question, traceFallback, true, instructionLanguage))}><span aria-hidden="true">?</span></button>
          <progress className="one-c-progress" value={run.index + (feedback === "correct" ? 1 : 0)} max={run.questions.length} aria-label={run.reviewing ? "Review progress" : "Game progress"} />
          {run.reviewing && <p className="one-c-review-note">{isSentence ? "Let’s try again!" : "Let’s try the words you needed a little help with."}</p>}
          <div className={`one-c-play-card ${isSentence ? "sentence" : ""}`}>
            {(question.mode === "meaning" || showSentenceText) && <><div className="one-c-prompt-hanzi" lang="zh-CN">{speechText(question.word)}</div>{isSentence && <div className="one-c-pinyin" lang="zh-Latn-pinyin">{question.word.example?.pinyin ?? question.word.pinyin}</div>}</>}
            {(question.mode === "recognize" || question.mode === "trace") && <div className="one-c-prompt-english">{question.word.icon} {question.word.english}</div>}
            {isListening && <div className="one-c-listen-prompt"><button className="one-c-big-listen" disabled={!audio.enabled} aria-label={isSentence ? "Hear the sentence again" : "Listen to the Chinese sounds"} onClick={() => audio.play(speechText(question.word))}><SoundIcon /></button><p>{isSentence || isSound ? "Hear it again" : "Tap to hear the Chinese words."}</p><button className="one-c-text-button" disabled={!audio.enabled} aria-label="Listen slowly" onClick={() => audio.play(speechText(question.word), "zh", true)}>Slow</button></div>}
            {isSound && (question.mode === "sound-read" || !audio.canListen || audio.message) && <p className="one-c-prompt-english">{question.word.soundCue}</p>}
            {question.mode === "trace" && !traceFallback && <TraceCharacter key={question.id} hanzi={question.word.hanzi} onComplete={solved} onHelp={() => { markMissed(); setWrong(["trace"]); }} onFallback={() => { setTraceFallback(true); audio.narrate(questionNarration(lesson, question, true, true, instructionLanguage)); }} />}
            {question.pair && <CompareScene pair={question.pair} sign={feedback === "correct" ? question.word.hanzi : "?"} />}
            {question.sequence && <NumberSequence values={question.sequence} answer={feedback === "correct" ? question.word.value : undefined} />}
            {question.mode === "count" && <TenFrame key={question.id} value={question.word.value!} />}
            {!isListening && <button className="one-c-text-button one-c-read-prompt" disabled={!audio.enabled} aria-label="Listen to the question" onClick={() => audio.narrate(questionNarration(lesson, question, traceFallback, false, instructionLanguage))}><SoundIcon /> Listen</button>}

            {(question.mode !== "trace" || traceFallback) && <div className={`one-c-options ${isSentence || lesson.week === 2 ? "sentence-choices" : ""}`} role="group" aria-label="Answer choices">{question.options.map((option) => {
              const chinese = question.mode === "recognize" || question.mode === "count" || question.mode === "trace" || question.mode === "compare";
              const symbol = isSound || question.mode === "order";
              const label = option.choiceLabel ?? option.english;
              const isWrong = wrong.includes(option.id);
              const isCorrect = feedback === "correct" && option.id === question.word.id;
              return <div key={option.id} className={`one-c-option-row ${isWrong ? "wrong" : ""} ${isCorrect ? "correct" : ""}`}>
                <button className={`one-c-option ${chinese || symbol ? "chinese" : ""}`} disabled={isWrong || feedback === "correct"} onClick={() => answer(option.id)}>
                  {!chinese && !symbol && <span className="one-c-option-icon" aria-hidden="true">{option.icon}</span>}
                  <span className="one-c-option-label" lang={isSound ? "zh-Latn-pinyin" : chinese ? "zh-CN" : "en"}>{question.mode === "order" ? option.value : chinese || symbol ? option.hanzi : label}{question.mode === "compare" && <span className="one-c-choice-pinyin" lang="zh-Latn-pinyin">{option.pinyin}</span>}</span>
                  {isWrong && <span className="one-c-choice-state">Again</span>}{isCorrect && <span className="one-c-choice-state">✓ Correct</span>}
                </button>
                {question.mode === "compare" && <button className="one-c-option-audio" aria-label={`Hear ${option.hanzi}`} disabled={!audio.enabled} onClick={() => audio.play(speechText(option))}><SoundIcon /></button>}
                {!chinese && !isSound && question.mode !== "order" && <button className="one-c-option-audio" aria-label={`Hear option: ${label}`} disabled={!audio.enabled} onClick={() => audio.narrate(spokenText(label))}><SoundIcon /></button>}
              </div>;
            })}</div>}

            {feedback !== "correct" && (question.mode !== "trace" || traceFallback) && <div className="one-c-hint">
              {!hint ? <button className="one-c-text-button" aria-label={isListening && !showSentenceText ? `Hint: ${hintLabel.toLowerCase()}` : "Hint"} onClick={revealHint}>Hint</button> : question.mode === "compare" ? <div>{COMPARISONS.map((item) => <button key={item.id} className="one-c-review-word" disabled={!audio.enabled} onClick={() => audio.narrate(comparisonHintNarration([item]))}><span><span lang="zh-CN">{item.hanzi}</span> · <span lang="zh-Latn-pinyin">{item.pinyin}</span><br />{item.english}</span><SoundIcon /></button>)}</div> : <div>{questionDetails(question)}{listenButtons(questionSpeech(question))}</div>}
              {question.mode === "listen" && !isSentence && (!audio.canListen || audio.message) && !hint && <p className="one-c-small">No audio? Tap “Hint” to keep playing.</p>}
            </div>}
          </div>
          <div className={`one-c-feedback ${feedback}`} aria-live="polite" aria-atomic="true">
            {feedback === "wrong" && <p>{isSentence ? "Good try! Tap the other one." : "Good try! Choose another answer, or take a hint."}</p>}
            {feedback === "correct" && <>
              <div><strong>太棒了！ Great work!</strong>{questionDetails(question)}</div>
              <button className="one-c-button primary" ref={nextButton} aria-label={run.index + 1 === run.questions.length ? !run.reviewing && run.missed.length ? "Again: practice tricky words" : "Done: collect your star" : "Next question"} onClick={advance}>{run.index + 1 === run.questions.length ? !run.reviewing && run.missed.length ? "Again" : "Done" : "Next"}<span aria-hidden="true">→</span></button>
            </>}
          </div>
        </section>}

        {screen === "complete" && run && <section className="one-c-complete">
          <div className="ice-penguin-celebration" aria-hidden="true"><img src={POLAR_ART.penguin} alt="" width="1254" height="1254" /><span>★</span></div>
          <div className="one-c-eyebrow">Week {lesson.week} · {lesson.title} · Star earned</div>
          <h1 ref={heading} tabIndex={-1}>You did it!</h1>
          <p>You practiced {isSentence ? "three whole sentences" : isSound ? `${lesson.words.length} pinyin sounds` : lesson.kind === "compare" ? "comparing numbers" : lesson.kind === "order" ? "putting numbers in order" : `${lesson.words.length} ${lesson.kind === "numbers" ? "numbers" : "Chinese characters"}`}.</p>
          {run.missed.length > 0 && <p className="one-c-small">And you gave the tricky ones another go. That’s how we learn!</p>}
          {WEEKS.map((week) => <div className="one-c-week-stars" key={week.number}><strong>Week {week.number}</strong><div className="one-c-stars">{week.lessons.map((item) => <span key={item.id} className={progress[item.id] ? "earned" : ""} aria-label={`${item.title}: ${progress[item.id] ? "star earned" : "not yet completed"}`}>★</span>)}</div></div>)}
          <p className="one-c-small">{learned === LESSONS.length ? "All stars earned! You explored every island!" : `${learned} of ${LESSONS.length} island stars`}</p>
          <div className="one-c-complete-actions"><button className="one-c-button primary" aria-label={learned === LESSONS.length ? "Map: back to the ice path" : "Next lesson"} onClick={() => showMap(learned === LESSONS.length ? lesson.id : nextLesson.id)}>{learned === LESSONS.length ? "Map" : "Next"}<span aria-hidden="true">→</span></button><button className="one-c-button secondary" aria-label="Play this lesson again" onClick={startGame}>Again</button></div>
          <details className="one-c-practiced"><summary>Practice</summary>{lesson.words.map((item) => <button className="one-c-review-word" key={item.id} disabled={!audio.enabled} onClick={() => audio.play(speechText(item))}>{pronunciation(item, isSentence)}<SoundIcon /></button>)}</details>
        </section>}
        <div className="one-c-notices" role="status">{audio.message && <p>{audio.message}</p>}{storageNotice && <p>{storageNotice}</p>}</div>
      </main>
      <footer className="one-c-footer"><span>Grade 1C · {screen === "home" ? "Weeks 1 & 2" : `Week ${week.number} · ${week.title}`}</span><a href="/">More Chinese games ↗</a></footer>
    </div>
  </div>;
}
