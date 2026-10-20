import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";
import { getCharacterStroke, type Stroke } from "../../data/strokes";

export type WritingMode = "guided" | "recall";
export type WritingAttempt = { assisted: boolean; lastStrokeName?: string };
type Props = { hanzi: string; mode: WritingMode; onComplete: (result: WritingAttempt) => void; onStrokeName: (name: string) => void; onHelp: (kind: "miss" | "hint") => void };

export default function TraceCharacter({ hanzi, mode, onComplete, onStrokeName, onHelp }: Props) {
  const board = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);
  const callbacks = useRef({ onComplete, onStrokeName, onHelp });
  const [strokeLabel, setStrokeLabel] = useState<Stroke | null>(null);
  const totalStrokes = useRef(0);
  const [status, setStatus] = useState("Loading your character…");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const assisted = useRef(false);
  const nextStroke = useRef(0);
  useEffect(() => { callbacks.current = { onComplete, onStrokeName, onHelp }; });

  useEffect(() => {
    const element = board.current;
    if (!element) return;
    let active = true;
    let finished = false;
    let loadFailed = false;
    assisted.current = mode === "guided";
    setReady(false); setDone(false); setFailed(false); setStrokeLabel(null); nextStroke.current = 0;
    setStatus("Loading your character…");
    const fail = () => {
      if (!active || loadFailed) return;
      loadFailed = true;
      setReady(false); setFailed(true);
      setStatus("The drawing pad couldn't load. Try again to keep writing.");
    };
    const size = Math.min(280, element.clientWidth || 280);
    const timeout = window.setTimeout(fail, 10000);
    const instance = HanziWriter.create(element, hanzi, {
      width: size, height: size, padding: 22, showCharacter: false, showOutline: mode === "guided",
      outlineColor: "#52657e", strokeColor: "#a7f3d0", drawingColor: "#fcd34d",
      highlightColor: "#67e8f9", highlightCompleteColor: "#fcd34d", drawingWidth: 14,
      onLoadCharDataError: fail,
    });
    writer.current = instance;
    void instance.getCharacterData().then((character) => {
      window.clearTimeout(timeout);
      if (!active || loadFailed) return;
      totalStrokes.current = character.strokes.length;
      setReady(true);
      setStatus(mode === "guided" ? "Trace first. Then try on your own." : "Write the whole character without hints.");
      void instance.quiz({
        leniency: 1.5, showHintAfterMisses: 1, acceptBackwardsStrokes: false,
        onMistake: () => {
          if (!active || finished) return;
          assisted.current = true;
          callbacks.current.onHelp("miss");
          void instance.showOutline();
          setStatus("Follow the hint. Then try the whole character again.");
        },
        onCorrectStroke: ({ strokeNum, strokesRemaining }) => {
          if (!active || finished) return;
          const stroke = getCharacterStroke(hanzi, strokeNum, totalStrokes.current);
          setStrokeLabel(stroke);
          if (stroke && strokesRemaining) callbacks.current.onStrokeName(stroke.name);
          nextStroke.current = strokeNum + 1;
          if (strokesRemaining && assisted.current) void instance.highlightStroke(strokeNum + 1);
        },
        onComplete: ({ totalMistakes }) => {
          if (!active || finished) return;
          finished = true;
          const neededHelp = assisted.current || totalMistakes !== 0;
          setDone(true);
          setStatus(mode === "guided" ? "Ready to try on your own." : neededHelp ? "Now try the whole character without hints." : "You wrote it on your own!");
          callbacks.current.onComplete({ assisted: neededHelp, lastStrokeName: getCharacterStroke(hanzi, totalStrokes.current - 1, totalStrokes.current)?.name });
        },
      });
      if (mode === "guided") void instance.highlightStroke(0);
    }).catch(fail);
    return () => {
      active = false;
      window.clearTimeout(timeout);
      instance.cancelQuiz();
      element.replaceChildren();
      writer.current = null;
    };
  }, [hanzi, mode, loadVersion]);

  return <div className="one-c-trace">
    <div className="one-c-trace-board" ref={board} role="img" aria-label={mode === "guided" ? `Trace ${hanzi}` : "Write the character from memory"} />
    <p className="one-c-small" role="status">{status}</p>
    {strokeLabel && <p className="one-c-small" aria-live="polite"><span lang="zh-CN">{strokeLabel.name}</span> · <span lang="zh-Latn-pinyin">{strokeLabel.pinyin}</span> · {strokeLabel.english}</p>}
    <div className="one-c-audio-controls">
      {failed ? <button className="one-c-button secondary" onClick={() => setLoadVersion(version => version + 1)}>Retry drawing pad</button> : <button className="one-c-button secondary" disabled={!ready || done} aria-label="Show the next stroke" onClick={() => {
        assisted.current = true; callbacks.current.onHelp("hint");
        void writer.current?.showOutline();
        const stroke = getCharacterStroke(hanzi, nextStroke.current, totalStrokes.current);
        setStrokeLabel(stroke); if (stroke) callbacks.current.onStrokeName(stroke.name);
        void writer.current?.highlightStroke(nextStroke.current);
        setStatus("Follow the hint. Then try the whole character again.");
      }}>Hint</button>}
    </div>
  </div>;
}
