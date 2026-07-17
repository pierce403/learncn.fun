import {
  AVAILABLE_LEVELS,
  getLevelDefinition,
  type LevelId,
  type PracticeScope,
} from "../data/words";

export type LevelSelectorProps = {
  level: LevelId;
  scope: PracticeScope;
  onLevelChange: (level: LevelId) => void;
  onScopeChange: (scope: PracticeScope) => void;
};

export function LevelSelector({ level, scope, onLevelChange, onScopeChange }: LevelSelectorProps) {
  const definition = getLevelDefinition(level);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex min-w-44 flex-col gap-1.5 text-xs font-medium text-slate-400">
        Book level
        <select
          value={level}
          onChange={(event) => onLevelChange(Number(event.target.value) as LevelId)}
          className="h-10 rounded-xl bg-slate-800 px-3 text-sm font-semibold text-slate-100 ring-1 ring-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
        >
          {AVAILABLE_LEVELS.map((candidate) => {
            const candidateDefinition = getLevelDefinition(candidate);
            return (
              <option key={candidate} value={candidate}>
                Level {candidate} · {candidateDefinition.cumulativeTarget.toLocaleString()} characters
              </option>
            );
          })}
        </select>
      </label>

      <div>
        <div className="text-xs font-medium text-slate-400">Practice</div>
        <div className="mt-1.5 inline-flex rounded-xl bg-slate-950/40 p-1 ring-1 ring-slate-700/40">
          {(
            [
              ["through", `All ${definition.cumulativeTarget}`],
              ["introduced", `${definition.introducedTarget} new`],
            ] as const
          ).map(([value, label]) => {
            const selected = scope === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onScopeChange(value)}
                aria-pressed={selected}
                className={[
                  "h-8 touch-manipulation rounded-lg px-3 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300/40",
                  selected
                    ? "bg-amber-300 text-amber-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
