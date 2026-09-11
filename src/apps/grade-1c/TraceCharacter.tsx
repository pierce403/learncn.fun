import { useEffect, useRef, useState } from "react";
import HanziWriter from "hanzi-writer";

type Props = { hanzi: string; onComplete: () => void; onHelp: () => void; onFallback: () => void };

export default function TraceCharacter({ hanzi, onComplete, onHelp, onFallback }: Props) {
  const board = useRef<HTMLDivElement>(null);
  const writer = useRef<HanziWriter | null>(null);
  const callbacks = useRef({ onComplete, onHelp, onFallback });
  const [status, setStatus] = useState("Loading your character…");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const nextStroke = useRef(0);
  useEffect(() => { callbacks.current = { onComplete, onHelp, onFallback }; });

  useEffect(() => {
    const element = board.current;
    if (!element) return;
    let active = true;
    const size = Math.min(280, element.clientWidth || 280);
    const timeout = window.setTimeout(() => { if (active) callbacks.current.onFallback(); }, 10000);
    const instance = HanziWriter.create(element, hanzi, {
      width: size, height: size, padding: 22, showCharacter: false, showOutline: true,
      outlineColor: "#52657e", strokeColor: "#a7f3d0", drawingColor: "#fcd34d",
      highlightColor: "#67e8f9", highlightCompleteColor: "#fcd34d", drawingWidth: 14,
      onLoadCharDataError: () => { if (active) callbacks.current.onFallback(); },
    });
    writer.current = instance;
    void instance.getCharacterData().then(() => {
      window.clearTimeout(timeout);
      if (!active) return;
      setReady(true);
      setStatus("Trace the glowing stroke.");
      void instance.quiz({
        leniency: 1.5, showHintAfterMisses: 1, acceptBackwardsStrokes: false,
        onMistake: () => { if (active) { callbacks.current.onHelp(); setStatus("Try the glowing stroke again."); } },
        onCorrectStroke: ({ strokeNum, strokesRemaining }) => {
          if (!active) return;
          nextStroke.current = strokeNum + 1;
          if (strokesRemaining) { setStatus("Good! Trace the next stroke."); void instance.highlightStroke(strokeNum + 1); }
        },
        onComplete: () => { if (active) { setDone(true); setStatus("You wrote it!"); callbacks.current.onComplete(); } },
      });
      void instance.highlightStroke(0);
    }).catch(() => { if (active) callbacks.current.onFallback(); });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      instance.cancelQuiz();
      element.replaceChildren();
      writer.current = null;
    };
  }, [hanzi]);

  return <div className="one-c-trace">
    <div className="one-c-trace-board" ref={board} role="img" aria-label={`Finger-tracing area for ${hanzi}. You can also choose Tap instead.`} />
    <p className="one-c-small" role="status">{status}</p>
    <div className="one-c-audio-controls">
      <button className="one-c-button secondary" disabled={!ready || done} onClick={() => { callbacks.current.onHelp(); void writer.current?.highlightStroke(nextStroke.current); }}>Show the stroke</button>
      <button className="one-c-text-button" disabled={done} onClick={onFallback}>Tap instead</button>
    </div>
  </div>;
}
