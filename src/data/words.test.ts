import { describe, expect, it } from "vitest";
import {
  ALL_LEVELS,
  AVAILABLE_LEVELS,
  getLevelDefinition,
  getChineseSpeechText,
  getWordsForLevel,
  LEVELS,
  WORDS,
  WORDS_BY_LEVEL,
  type LevelId,
} from "./words";

const EXPECTED_CUMULATIVE_TARGETS = [
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

describe("graded-reader level metadata", () => {
  it("models all fourteen cumulative thresholds from the series", () => {
    expect(ALL_LEVELS).toHaveLength(14);
    expect(LEVELS.map((level) => level.cumulativeTarget)).toEqual(EXPECTED_CUMULATIVE_TARGETS);
    expect(LEVELS.map((level) => level.introducedTarget)).toEqual([
      60,
      60,
      60,
      60,
      70,
      80,
      100,
      110,
      150,
      200,
      300,
      430,
      580,
      740,
    ]);
  });

  it("loads complete transcriptions for Levels 1 through 6", () => {
    expect(AVAILABLE_LEVELS).toEqual([1, 2, 3, 4, 5, 6]);

    for (const level of AVAILABLE_LEVELS) {
      const expected = getLevelDefinition(level).introducedTarget;
      expect(WORDS_BY_LEVEL[level], `Level ${level} introduced characters`).toHaveLength(expected);
      expect(getWordsForLevel(level, "through"), `Level ${level} cumulative characters`).toHaveLength(
        getLevelDefinition(level).cumulativeTarget,
      );
    }
  });

  it("keeps roadmap levels empty until an exact list is available", () => {
    for (const level of ALL_LEVELS.filter(
      (candidate) => !(AVAILABLE_LEVELS as readonly LevelId[]).includes(candidate),
    )) {
      expect(WORDS_BY_LEVEL[level]).toBeUndefined();
      expect(getWordsForLevel(level, "introduced")).toEqual([]);
      expect(getWordsForLevel(level, "through")).toEqual([]);
    }
  });
});

describe("character catalog integrity", () => {
  it("uses one unique Han character and stable ID per entry", () => {
    const ids = new Set<string>();
    const characters = new Set<string>();

    for (const word of WORDS) {
      expect(word.hanzi).toMatch(/^\p{Script=Han}$/u);
      expect(word.id).toBe(`hanzi-${word.hanzi.codePointAt(0)?.toString(16)}`);
      expect(ids.has(word.id), `duplicate id ${word.id}`).toBe(false);
      expect(characters.has(word.hanzi), `duplicate character ${word.hanzi}`).toBe(false);
      expect(word.pinyin.trim()).not.toBe("");
      expect(word.english.trim()).not.toBe("");
      expect(AVAILABLE_LEVELS).toContain(word.introducedAt);
      ids.add(word.id);
      characters.add(word.hanzi);
    }

    expect(WORDS).toHaveLength(390);
  });

  it("returns only the newly introduced set when requested", () => {
    for (const level of AVAILABLE_LEVELS) {
      const words = getWordsForLevel(level, "introduced");
      expect(words.every((word) => word.introducedAt === level)).toBe(true);
    }
  });

  it("rejects invalid levels without leaking earlier vocabulary", () => {
    expect(getWordsForLevel(14 as LevelId, "through")).toEqual([]);
  });

  it("gives polyphonic characters enough speech context for the catalog reading", () => {
    const expectedSpeech = {
      只: "一只",
      长: "长大",
      觉: "觉得",
      为: "成为",
      干: "干草",
      数: "数字",
      种: "一种",
      还: "还有",
      得: "得到",
      乐: "快乐",
    } as const;

    for (const [hanzi, speechText] of Object.entries(expectedSpeech)) {
      const word = WORDS.find((candidate) => candidate.hanzi === hanzi);
      expect(word, `speech entry for ${hanzi}`).toBeDefined();
      expect(getChineseSpeechText(word!), `speech context for ${hanzi}`).toBe(speechText);
    }
  });
});
