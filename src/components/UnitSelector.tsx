import type { UnitId } from "../data/words";

export type UnitSelectorProps = {
  selectedUnits: readonly UnitId[];
  onToggle: (unit: UnitId) => void;
};

const ALL_UNITS: UnitId[] = [1, 2, 3];

export function UnitSelector({ selectedUnits, onToggle }: UnitSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ALL_UNITS.map((unit) => {
        const isSelected = selectedUnits.includes(unit);
        const label = `Unit ${unit}`;

        const className = [
          "inline-flex touch-manipulation items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-slate-300/40",
          isSelected
            ? "bg-amber-300 text-amber-950 ring-amber-200/50 hover:bg-amber-200"
            : "bg-slate-800 text-slate-100 ring-slate-700/40 hover:bg-slate-700",
        ].join(" ");

        return (
          <button
            key={unit}
            type="button"
            onClick={() => onToggle(unit)}
            className={className}
            aria-pressed={isSelected}
            title={`Toggle ${label}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
