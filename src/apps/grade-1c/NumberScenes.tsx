import { useState } from "react";
import type { Word } from "./curriculum";

export function FishGroup({ value, label }: { value: number; label: string }) {
  return <div className="one-c-fish-group" aria-label={`${label}: ${value} fish`}>
    <span className="one-c-small">{label}</span><strong>{value}</strong>
    <div className="one-c-fish-grid" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i}>{i < value ? "🐟" : ""}</span>)}</div>
  </div>;
}

export function SumScene({ parts, missing, reveal = false, onCount, mathModel, story, language = "en" }: {
  parts: [number, number]; missing: "part" | "total"; reveal?: boolean; onCount?: (value: number) => void; mathModel?: Word["mathModel"]; story?: Word["story"]; language?: "en" | "zh";
}) {
  const [counted, setCounted] = useState<number[]>([]);
  const [left, right] = parts;
  const total = left + right;
  const equation = `${left} + ${missing === "part" && !reveal ? "?" : right} = ${missing === "total" && !reveal ? "?" : total}`;
  return <div className="one-c-sum-scene">
    {story && <p className="one-c-story" lang={language === "zh" ? "zh-CN" : "en"}>{story[language]}</p>}
    <div className="one-c-sum-equation" aria-label={equation}>{equation}</div>
    {mathModel === "number-line" ? <AdditionNumberLine parts={parts} reveal={reveal} onCount={onCount} /> : mathModel === "dice" ? <DicePair parts={parts} onCount={onCount} /> : <div className="one-c-sum-frame" role="group" aria-label="Count the two groups together">
      {Array.from({ length: 10 }, (_, index) => index < total
        ? <button key={index} className={`one-c-sum-dot ${index < left ? "first" : "second"}`} aria-label={missing === "part" ? `Count ${index < left ? "circle" : "diamond"} ${index < left ? index + 1 : index - left + 1}` : `Count dot ${index + 1}`} aria-pressed={counted.includes(index)} onClick={() => {
            setCounted((previous) => previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index]);
            onCount?.(missing === "part" && index >= left ? index - left + 1 : index + 1);
          }}><span aria-hidden="true">{index < left ? "●" : "◆"}</span>{counted.includes(index) && <span className="one-c-sum-check" aria-hidden="true">✓</span>}</button>
        : <span key={index} className="one-c-sum-empty" aria-hidden="true" />)}
    </div>}
    <p className="one-c-small">{missing === "part" ? "How many diamonds?" : "How many altogether?"}</p>
  </div>;
}

export function CompareScene({ pair, sign = "?" }: { pair: [number, number]; sign?: string }) {
  return <div className="one-c-compare-scene"><FishGroup value={pair[0]} label="Left" /><span className="one-c-missing-sign" lang="zh-CN">{sign}</span><FishGroup value={pair[1]} label="Right" /></div>;
}

export function NumberSequence({ values, answer }: { values: (number | null)[]; answer?: number }) {
  return <div className="one-c-number-sequence" aria-label={`Number sequence: ${values.map(value => value ?? answer ?? "missing number").join(", ")}`}>
    {values.map((value, index) => <span className={`one-c-sequence-number ${value === null ? "missing" : ""}`} key={index}>{value ?? answer ?? "?"}{index < values.length - 1 && <span className="one-c-sequence-arrow" aria-hidden="true">→</span>}</span>)}
  </div>;
}

function AdditionNumberLine({ parts: [start, hops], reveal, onCount }: { parts: [number, number]; reveal: boolean; onCount?: (value: number) => void }) {
  const [taken, setTaken] = useState(0);
  const shown = reveal ? hops : taken;
  const x = (value: number) => 24 + value * 28;
  return <div className="one-c-number-line">
    <p className="one-c-small">Start at {start}. Hop forward {hops} {hops === 1 ? "time" : "times"}.</p>
    <svg viewBox="0 0 328 110" role="img" aria-label={`Number line from 0 to 10. Start at ${start}. ${shown} of ${hops} hops. Now at ${start + shown}.`}>
      <path d="M24 68 H304" stroke="currentColor" strokeWidth="2" />
      {Array.from({ length: 11 }, (_, value) => <g key={value}>
        <path d={`M${x(value)} 63 v10`} stroke="currentColor" strokeWidth="2" />
        <text x={x(value)} y="96" textAnchor="middle" fill="currentColor" fontSize="16">{value}</text>
      </g>)}
      {Array.from({ length: shown }, (_, index) => <path key={index} d={`M${x(start + index)} 59 q14 -38 28 0 l-6 -5 m6 5 l2 -8`} fill="none" stroke="#6ee7b7" strokeWidth="2.5" />)}
      <circle cx={x(start + shown)} cy="68" r="6" fill="#fcd34d" />
    </svg>
    {!reveal && <><button className="one-c-button secondary" disabled={taken === hops} onClick={() => { setTaken(taken + 1); onCount?.(start + taken + 1); }}>Hop</button><p className="one-c-small" aria-live="polite">{taken} of {hops} hops{taken === hops ? ` · Landed on ${start + hops}` : ""}</p></>}
  </div>;
}

const DIE_SPOTS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
function DicePair({ parts, onCount }: { parts: [number, number]; onCount?: (value: number) => void }) {
  const [counted, setCounted] = useState<number[]>([]);
  return <div className="one-c-dice-pair" role="group" aria-label="Count the dots on both dice">
    {parts.map((value, die) => <div className={`one-c-die die-${die}`} role="group" aria-label={`Die ${die + 1}: ${value} dots`} key={die}>
      {Array.from({ length: 9 }, (_, spot) => {
        const index = DIE_SPOTS[value].indexOf(spot);
        const count = (die === 0 ? 0 : parts[0]) + index + 1;
        return index < 0 ? <span key={spot} /> : <button key={spot} aria-label={`Count die ${die + 1}, dot ${index + 1}`} aria-pressed={counted.includes(count)} onClick={() => { setCounted(previous => previous.includes(count) ? previous.filter(item => item !== count) : [...previous, count]); onCount?.(count); }}><span aria-hidden="true">{counted.includes(count) ? "✓" : "●"}</span></button>;
      })}
    </div>)}
  </div>;
}
