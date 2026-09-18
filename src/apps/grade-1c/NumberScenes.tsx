import { useState } from "react";

export function FishGroup({ value, label }: { value: number; label: string }) {
  return <div className="one-c-fish-group" aria-label={`${label}: ${value} fish`}>
    <span className="one-c-small">{label}</span><strong>{value}</strong>
    <div className="one-c-fish-grid" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i}>{i < value ? "🐟" : ""}</span>)}</div>
  </div>;
}

export function SumScene({ parts, missing, reveal = false, onCount }: {
  parts: [number, number]; missing: "part" | "total"; reveal?: boolean; onCount?: (value: number) => void;
}) {
  const [counted, setCounted] = useState<number[]>([]);
  const [left, right] = parts;
  const total = left + right;
  const equation = `${left} + ${missing === "part" && !reveal ? "?" : right} = ${missing === "total" && !reveal ? "?" : total}`;
  return <div className="one-c-sum-scene">
    <div className="one-c-sum-equation" aria-label={equation}>{equation}</div>
    <div className="one-c-sum-frame" role="group" aria-label="Count the two groups together">
      {Array.from({ length: 10 }, (_, index) => index < total
        ? <button key={index} className={`one-c-sum-dot ${index < left ? "first" : "second"}`} aria-label={missing === "part" ? `Count ${index < left ? "circle" : "diamond"} ${index < left ? index + 1 : index - left + 1}` : `Count dot ${index + 1}`} aria-pressed={counted.includes(index)} onClick={() => {
            setCounted((previous) => previous.includes(index) ? previous.filter((item) => item !== index) : [...previous, index]);
            onCount?.(missing === "part" && index >= left ? index - left + 1 : index + 1);
          }}><span aria-hidden="true">{index < left ? "●" : "◆"}</span>{counted.includes(index) && <span className="one-c-sum-check" aria-hidden="true">✓</span>}</button>
        : <span key={index} className="one-c-sum-empty" aria-hidden="true" />)}
    </div>
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
