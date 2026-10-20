import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import type { Stroke } from '../../data/strokes';
import { gradeStroke, strokePoints, type DrawingResult, type Point } from './drawing';

export default function StrokeDrawing({ stroke, complete, animationKey, onAttempt, onBegin }: {
  stroke: Stroke; complete: boolean; animationKey: number;
  onAttempt: (result: DrawingResult) => void; onBegin: () => void;
}) {
  const target = useMemo(() => strokePoints(stroke.path), [stroke.path]);
  const [ink, setInk] = useState<Point[]>([]);
  const [result, setResult] = useState<DrawingResult | null>(null);
  const active = useRef<number | null>(null);
  const points = useRef<Point[]>([]);
  const accepted = useRef(false);
  const start = target[0];
  const end = target[target.length - 1];

  useEffect(() => {
    if (!complete && active.current === null) { points.current = []; setInk([]); setResult(null); }
  }, [animationKey, complete]);

  function position(event: PointerEvent<SVGSVGElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    return {
      x: (event.clientX - rect.left - (rect.width - size) / 2) / size * 100,
      y: (event.clientY - rect.top - (rect.height - size) / 2) / size * 100,
    };
  }
  function begin(event: PointerEvent<SVGSVGElement>) {
    if (complete || accepted.current || active.current !== null || event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    active.current = event.pointerId;
    points.current = [position(event)];
    setInk(points.current); setResult(null); onBegin();
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    if (active.current !== event.pointerId) return;
    const point = position(event);
    const last = points.current[points.current.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < .6) return;
    points.current = [...points.current, point];
    setInk(points.current);
  }
  function release(event: PointerEvent<SVGSVGElement>) {
    active.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function finish(event: PointerEvent<SVGSVGElement>) {
    if (active.current !== event.pointerId) return;
    points.current = [...points.current, position(event)];
    setInk(points.current);
    release(event);
    const grade = gradeStroke(points.current, target);
    accepted.current = grade === 'correct';
    setResult(grade); onAttempt(grade);
  }
  function cancel(event: PointerEvent<SVGSVGElement>) {
    if (active.current !== event.pointerId) return;
    release(event); points.current = []; setInk([]); setResult(null);
  }
  function clear() {
    if (active.current !== null) return;
    points.current = []; setInk([]); setResult(null); onBegin();
  }

  return <div className="stroke-drawing">
    <svg viewBox="0 0 100 100" className={`stroke-pad ${complete ? 'complete' : ''}`} role="img"
      aria-label={`Drawing area for ${stroke.name}: ${stroke.english}. Draw from the gold dot to the ring in one stroke.`}
      onPointerDown={begin} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel}>
      <path className="stroke-grid" d="M50 0V100M0 50H100M0 0L100 100M0 100L100 0" />
      <path className="stroke-guide" d={stroke.path} />
      {!ink.length && <path key={animationKey} className="stroke-ink stroke-demo" d={stroke.path} pathLength="1" />}
      <circle cx={end.x} cy={end.y} r="4" className="stroke-end" />
      {ink.length > 0 && <path className={`stroke-user-ink ${result && result !== 'correct' ? 'retry' : ''}`} d={ink.map((point, i) => `${i ? 'L' : 'M'}${point.x} ${point.y}`).join(' ')} />}
      <circle cx={start.x} cy={start.y} r="3.5" className="stroke-start" />
    </svg>
    {!complete && <button className="strokes-text-button" disabled={!ink.length} onClick={clear}>Clear drawing</button>}
  </div>;
}
