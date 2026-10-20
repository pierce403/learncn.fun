import { LEVEL_CHARACTER_SEEDS } from "./level-character-seeds";

export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  introducedAt: LevelId;
};

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export type AvailableLevelId = 1 | 2 | 3 | 4 | 5 | 6;

export type PracticeScope = "introduced" | "through";

export type LevelStatus = "transcribed" | "planned";

export type LevelDefinition = {
  id: LevelId;
  cumulativeTarget: number;
  introducedTarget: number;
  status: LevelStatus;
};

const CUMULATIVE_TARGETS = [
  60,
  120,
  180,
  240,
  310,
  390,
  490,
  600,
  750,
  950,
  1250,
  1680,
  2260,
  3000,
] as const;

export const ALL_LEVELS: readonly LevelId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const AVAILABLE_LEVELS: readonly AvailableLevelId[] = [1, 2, 3, 4, 5, 6];

export const LEVELS: readonly LevelDefinition[] = ALL_LEVELS.map((id, index) => {
  const cumulativeTarget = CUMULATIVE_TARGETS[index];
  const previousTarget = index === 0 ? 0 : CUMULATIVE_TARGETS[index - 1];

  return {
    id,
    cumulativeTarget,
    introducedTarget: cumulativeTarget - previousTarget,
    status: (AVAILABLE_LEVELS as readonly LevelId[]).includes(id) ? "transcribed" : "planned",
  };
});

function makeWord(level: LevelId, seed: { hanzi: string; pinyin: string; english: string }): Word {
  const codePoints = Array.from(seed.hanzi)
    .map((character) => character.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

  return {
    id: `hanzi-${codePoints}`,
    ...seed,
    introducedAt: level,
  };
}

export const WORDS_BY_LEVEL: Readonly<Partial<Record<LevelId, readonly Word[]>>> = Object.fromEntries(
  AVAILABLE_LEVELS.map((level) => [
    level,
    LEVEL_CHARACTER_SEEDS[level].map((seed) => makeWord(level, seed)),
  ]),
);

export const WORDS: Word[] = AVAILABLE_LEVELS.flatMap((level) => WORDS_BY_LEVEL[level] ?? []);

export function isLevelAvailable(level: LevelId): boolean {
  return (AVAILABLE_LEVELS as readonly LevelId[]).includes(level);
}

export function getLevelDefinition(level: LevelId): LevelDefinition {
  return LEVELS[level - 1];
}

export function getWordsForLevel(level: LevelId, scope: PracticeScope): Word[] {
  if (!isLevelAvailable(level)) return [];
  if (scope === "introduced") return [...(WORDS_BY_LEVEL[level] ?? [])];

  return AVAILABLE_LEVELS.filter((candidate) => candidate <= level).flatMap(
    (candidate) => WORDS_BY_LEVEL[candidate] ?? [],
  );
}

export function getReadWordsForLevel(level: LevelId, scope: PracticeScope): Word[] {
  return getWordsForLevel(level, scope);
}

export function getWriteWordsForLevel(level: LevelId, scope: PracticeScope): Word[] {
  return getWordsForLevel(level, scope);
}

export function getChineseSpeechText(word: Word): string {
  // Speak the displayed character; let the selected Mandarin voice choose its reading.
  return word.hanzi;
}
