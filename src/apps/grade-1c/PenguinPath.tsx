import { useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import { LESSONS, WEEKS, type Lesson } from "./curriculum";
import type { Progress } from "./game";
import { HOP_DURATION_MS, ICE_MAP_HEIGHT, ICE_STOPS, ICE_WEEKS, POLAR_ART, iceRoutePath, lessonIndex, nextHop } from "./ice-path";

type Props = {
  progress: Progress;
  initialLessonId: string;
  destinationLessonId: string;
  onStart: (lesson: Lesson) => void;
  headingRef: Ref<HTMLHeadingElement>;
};

export default function PenguinPath({ progress, initialLessonId, destinationLessonId, onStart, headingRef }: Props) {
  const [current, setCurrent] = useState(() => lessonIndex(initialLessonId));
  const [destination, setDestination] = useState(() => lessonIndex(destinationLessonId));
  const [hop, setHop] = useState<{ from: number; to: number } | null>(null);
  const [reduceMotion, setReduceMotion] = useState(() => typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false));
  const selected = ICE_STOPS[destination].lesson;
  const moving = current !== destination;
  const completed = LESSONS.filter((lesson) => progress[lesson.id]).length;
  const startButton = useRef<HTMLButtonElement>(null);
  const hasExplored = useRef(false);
  const wasMoving = useRef(false);

  useEffect(() => {
    // Reveal the nearby action without pulling an already visible island away.
    if (destination >= 2 || hasExplored.current) startButton.current?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }, [destination, reduceMotion]);

  function exploreLesson(index: number) {
    hasExplored.current = true;
    if (index === destination) startButton.current?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    else setDestination(index);
  }

  useEffect(() => {
    if (wasMoving.current && !moving) startButton.current?.focus({ preventScroll: true });
    wasMoving.current = moving;
  }, [moving]);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const changed = () => setReduceMotion(query.matches);
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);

  useEffect(() => {
    if (current === destination) return;
    if (reduceMotion) {
      setCurrent(destination);
      setHop(null);
      return;
    }
    const next = nextHop(current, destination);
    setHop({ from: current, to: next });
    const timer = window.setTimeout(() => {
      setCurrent(next);
      setHop(null);
    }, HOP_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [current, destination, reduceMotion]);

  const from = ICE_STOPS[hop?.from ?? current];
  const to = ICE_STOPS[hop?.to ?? current];
  const penguinStyle = {
    left: `${from.x}%`, top: `${from.y}%`,
    "--hop-from-x": `${from.x}%`, "--hop-from-y": `${from.y}%`,
    "--hop-to-x": `${to.x}%`, "--hop-to-y": `${to.y}%`,
    "--hop-middle-x": `${(from.x + to.x) / 2}%`, "--hop-middle-y": `${(from.y + to.y) / 2}%`,
    "--hop-duration": `${HOP_DURATION_MS}ms`, "--float-delay": `${current * -.4}s`,
  } as CSSProperties;

  return <section className="ice-journey" aria-labelledby="ice-journey-title">
    <div className="ice-journey-heading">
      <div><div className="one-c-eyebrow"><span className="one-c-class-badge">1C</span> Your Chinese adventure</div><h1 id="ice-journey-title" ref={headingRef} tabIndex={-1}>Hop into Chinese!</h1><p>Pick a week. Let’s explore!</p></div>
      <div className="ice-star-total" aria-label={`${completed} of ${LESSONS.length} lesson stars earned`}><span aria-hidden="true">★</span><strong>{completed}<span> / {LESSONS.length}</span></strong></div>
    </div>

    <nav className="ice-week-nav" aria-label="Choose a week">{WEEKS.map((week) => <button key={week.number} className={`ice-week-link week-${week.number}`} aria-pressed={selected.week === week.number} disabled={moving} onClick={() => {
      const next = week.lessons.find((lesson) => !progress[lesson.id]) ?? week.lessons[0];
      exploreLesson(lessonIndex(next.id));
    }}><strong>Week {week.number}</strong><span>{week.title}</span><small>★ {week.lessons.filter((lesson) => progress[lesson.id]).length} / {week.lessons.length}</small></button>)}</nav>

    <div className="ice-journey-layout">
      <div className="ice-ocean" aria-label={`${LESSONS.length} floating lesson islands in ${WEEKS.length} weeks`} style={{ backgroundImage: `url(${POLAR_ART.water})`, height: `${ICE_MAP_HEIGHT}rem` }}>
        {ICE_WEEKS.map((week) => <div key={week.number} className={`ice-week-banner week-${week.number}`} style={{ top: `${week.y}%` }}>
          <div><h2>Week {week.number}</h2><span>{week.dates} · {week.title}</span></div>
          <strong aria-label={`${week.lessons.filter((lesson) => progress[lesson.id]).length} of ${week.lessons.length} stars`}>★ {week.lessons.filter((lesson) => progress[lesson.id]).length}/{week.lessons.length}</strong>
        </div>)}
        <svg className="ice-route-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{ICE_WEEKS.map((week) => <path key={week.number} d={iceRoutePath(week.stops)} />)}</svg>
        <ol className="ice-stops" aria-label="Lesson path">
          {ICE_STOPS.map(({ lesson, lessonNumber, x, y }, index) => <li key={lesson.id} className={`ice-stop ${x < 50 ? "left" : "right"} week-${lesson.week} ${progress[lesson.id] ? "completed" : ""} ${index === destination ? "selected" : ""}`} style={{ left: `${x}%`, top: `${y}%`, "--float-delay": `${index * -.4}s` } as CSSProperties}>
            <button className="ice-stop-button" disabled={moving} aria-current={index === destination ? "step" : undefined} aria-label={`Week ${lesson.week}, lesson ${lessonNumber}: ${lesson.title}. ${progress[lesson.id] ? "Star earned. Play again." : "Ready to play."}`} onClick={() => exploreLesson(index)}>
              <span className="ice-platform" aria-hidden="true"><img src={POLAR_ART.ice} alt="" width="1254" height="1254" draggable={false} /><span className={`ice-stop-number ${current === index ? "occupied" : ""}`}>{progress[lesson.id] ? "★" : lessonNumber}</span></span>
            </button>
            <div className="ice-stop-label">
              <button className="ice-lesson-select" disabled={moving} aria-current={index === destination ? "step" : undefined} onClick={() => exploreLesson(index)}>
                <span className="ice-stop-caption">{progress[lesson.id] ? "★ Star earned" : `Week ${lesson.week} · ${lessonNumber}`}</span><strong>{lesson.title}</strong><span lang={lesson.kind === "sounds" ? "zh-Latn-pinyin" : "zh-CN"}>{lesson.chinese}</span>
              </button>
              {index === destination && <button className="one-c-button primary ice-start-lesson" ref={startButton} aria-label={`${progress[lesson.id] ? "Practice again" : "Start lesson"}: ${lesson.title}`} onClick={() => onStart(lesson)}>{progress[lesson.id] ? "Practice again" : "Start lesson"}</button>}
            </div>
          </li>)}
        </ol>
        <div key={hop ? `${hop.from}-${hop.to}` : `rest-${current}`} className={`ice-penguin-position ${hop ? "hopping" : ""}`} style={penguinStyle} aria-hidden="true"><div className="ice-penguin-float"><img src={POLAR_ART.penguin} alt="" width="1254" height="1254" draggable={false} /></div></div>
        <span className="ice-finish-note">{completed === LESSONS.length ? "You explored every island!" : "A star on every island"}</span>
      </div>

    </div>
    <p className="sr-only" role="status" aria-live="polite">{moving ? `Hopping to Week ${selected.week}: ${selected.title}.` : `Penguin is on Week ${selected.week}, lesson ${ICE_STOPS[destination].lessonNumber}: ${selected.title}.`}</p>
  </section>;
}
