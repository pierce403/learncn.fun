export function FishGroup({ value, label }: { value: number; label: string }) {
  return <div className="one-c-fish-group" aria-label={`${label}: ${value} fish`}>
    <span className="one-c-small">{label}</span><strong>{value}</strong>
    <div className="one-c-fish-grid" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <span key={i}>{i < value ? "🐟" : ""}</span>)}</div>
  </div>;
}

export function CompareScene({ pair, sign = "?" }: { pair: [number, number]; sign?: string }) {
  return <div className="one-c-compare-scene"><FishGroup value={pair[0]} label="Left" /><span className="one-c-missing-sign">{sign}</span><FishGroup value={pair[1]} label="Right" /></div>;
}

export function NumberSequence({ values, answer }: { values: (number | null)[]; answer?: number }) {
  return <div className="one-c-number-sequence" aria-label={`Number sequence: ${values.map(value => value ?? answer ?? "missing number").join(", ")}`}>
    {values.map((value, index) => <span className={`one-c-sequence-number ${value === null ? "missing" : ""}`} key={index}>{value ?? answer ?? "?"}{index < values.length - 1 && <span className="one-c-sequence-arrow" aria-hidden="true">→</span>}</span>)}
  </div>;
}
