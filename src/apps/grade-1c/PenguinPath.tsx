import { useEffect, useRef, useState, type CSSProperties, type Ref } from "react";
import { LESSONS, type Lesson } from "./curriculum";
import type { Progress } from "./game";
import { HOP_DURATION_MS, ICE_STOPS, POLAR_ART, iceRoutePath, lessonIndex, nextHop } from "./ice-path";

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
  const stopElements = useRef<Array<HTMLLIElement | null>>([]);
  const wasMoving = useRef(false);

  useEffect(() => {
    // Keep later lessons visible on a phone, including when resuming progress.
    if (destination >= 2) stopElements.current[destination]?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
  }, [destination, reduceMotion]);

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
      <div><div className="one-c-eyebrow"><span className="one-c-class-badge">1C</span> Week 1 · I go to school</div><h1 id="ice-journey-title" ref={headingRef} tabIndex={-1}>Hop into Chinese!</h1><p>Five ice blocks. One little penguin. Let’s learn!</p></div>
      <div className="ice-star-total" aria-label={`${completed} of 5 lesson stars earned`}><span aria-hidden="true">★</span><strong>{completed}<span> / 5</span></strong></div>
    </div>

    <div className="ice-journey-layout">
      <div className="ice-ocean" aria-label="Five floating ice blocks, one for each lesson" style={{ backgroundImage: `url(${POLAR_ART.water})` }}>
        <div className="ice-map-instruction">Tap a block to hop over!</div>
        <svg className="ice-route-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d={iceRoutePath()} /></svg>
        <ol className="ice-stops" aria-label="Lesson path">
          {ICE_STOPS.map(({ lesson, x, y }, index) => <li key={lesson.id} ref={(element) => { stopElements.current[index] = element; }} className={`ice-stop ${index % 2 ? "right" : "left"} ${progress[lesson.id] ? "completed" : ""} ${index === destination ? "selected" : ""}`} style={{ left: `${x}%`, top: `${y}%`, "--float-delay": `${index * -.4}s` } as CSSProperties}>
            <button className="ice-stop-button" disabled={moving} aria-current={index === destination ? "step" : undefined} aria-label={`Lesson ${index + 1}: ${lesson.title}. ${progress[lesson.id] ? "Star earned. Play again." : "Ready to play."}`} onClick={() => setDestination(index)}>
              <span className="ice-platform" aria-hidden="true"><img src={POLAR_ART.ice} alt="" width="1254" height="1254" draggable={false} /><span className={`ice-stop-number ${current === index ? "occupied" : ""}`}>{progress[lesson.id] ? "★" : index + 1}</span></span>
              <span className="ice-stop-label"><span className="ice-stop-caption">{progress[lesson.id] ? "★ Star earned" : `Lesson ${index + 1}`}</span><strong>{lesson.title}</strong><span lang="zh-CN">{lesson.chinese}</span></span>
            </button>
          </li>)}
        </ol>
        <div key={hop ? `${hop.from}-${hop.to}` : `rest-${current}`} className={`ice-penguin-position ${hop ? "hopping" : ""}`} style={penguinStyle} aria-hidden="true"><div className="ice-penguin-float"><img src={POLAR_ART.penguin} alt="" width="1254" height="1254" draggable={false} /></div></div>
        <span className="ice-finish-note">{completed === 5 ? "You crossed the whole bay!" : "A star on every ice block"}</span>
      </div>

      <aside className="ice-lesson-dock" aria-labelledby="ice-selected-title">
        <div className="ice-dock-eyebrow">{progress[selected.id] ? "★ Ready for another go?" : `YOUR NEXT HOP · ${destination + 1} / 5`}</div>
        <h2 id="ice-selected-title">{selected.title}</h2>
        <p>{selected.description}</p>
        <button className="one-c-button primary ice-start-lesson" ref={startButton} disabled={moving} onClick={() => onStart(selected)}>{moving ? "Hop, hop…" : progress[selected.id] ? "Practice again" : "Start lesson"}<span aria-hidden="true">→</span></button>
        <div className="ice-dock-progress"><div className="one-c-stars" aria-hidden="true">{LESSONS.map((lesson) => <span key={lesson.id} className={progress[lesson.id] ? "earned" : ""}>★</span>)}</div><p>{completed === 5 ? "All five stars! You can practice any lesson again." : "Finish a lesson to earn its star. Your penguin will be ready for the next hop."}</p></div>
      </aside>
    </div>
    <p className="sr-only" role="status" aria-live="polite">{moving ? `Hopping to ${selected.title}.` : `Penguin is on lesson ${destination + 1}: ${selected.title}.`}</p>
  </section>;
}
