import { useEffect, useState } from "react";
import {
  isLevelAvailable,
  type LevelId,
  type PracticeScope,
} from "../data/words";

const STORAGE_KEY = "learncn.vocabularySelection.v1";

type StoredSelection = {
  level: LevelId;
  scope: PracticeScope;
};

const DEFAULT_SELECTION: StoredSelection = {
  level: 1,
  scope: "through",
};

function loadSelection(): StoredSelection {
  if (typeof window === "undefined") return DEFAULT_SELECTION;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SELECTION;
    const parsed = JSON.parse(raw) as Partial<StoredSelection>;
    const level = Number(parsed.level) as LevelId;
    const scope = parsed.scope;

    if (!isLevelAvailable(level)) return DEFAULT_SELECTION;
    if (scope !== "introduced" && scope !== "through") return DEFAULT_SELECTION;
    return { level, scope };
  } catch {
    return DEFAULT_SELECTION;
  }
}

export function useVocabularySelection() {
  const [selection, setSelection] = useState<StoredSelection>(loadSelection);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // Storage can be unavailable in private browsing or locked-down webviews.
    }
  }, [selection]);

  function setLevel(level: LevelId): void {
    if (!isLevelAvailable(level)) return;
    setSelection((current) => ({ ...current, level }));
  }

  function setScope(scope: PracticeScope): void {
    setSelection((current) => ({ ...current, scope }));
  }

  return {
    ...selection,
    setLevel,
    setScope,
  };
}
