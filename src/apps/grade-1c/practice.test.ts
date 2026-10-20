import { describe, expect, it } from "vitest";
import { LESSONS as OLD_LESSONS } from "./curriculum";
import { availableLessons, LESSONS } from "./weekly-curriculum";
import { activityComplete, choosePractice, continuousUnlocked, parseWordHistory, practicePool, priority, readPracticeProgress, recordResult, wordKey, type WordHistory } from "./practice";
const completeThrough = (week: number) => Object.fromEntries(availableLessons(week).map(l => [l.id, { completions: 1, best: 1, handwritingVerified: true as const }]));

describe("weekly completion and migration", () => {
  it("unlocks continuous only for complete available weeks and relocks for a newly opened week", () => {
    expect(continuousUnlocked({}, 0)).toBe(false);
    expect(continuousUnlocked({}, 8)).toBe(false);
    const progress = completeThrough(8);
    expect(continuousUnlocked(progress, 8)).toBe(true);
    expect(continuousUnlocked(progress, 9)).toBe(false);
    delete progress["characters-w4-write"];
    expect(continuousUnlocked(progress, 8)).toBe(false);
    progress["characters-w19-write"] = { completions: 1, best: 1, handwritingVerified: true as const };
    expect(continuousUnlocked(progress, 8)).toBe(false);
  });
  it("retains old tracing records but requires verified handwriting before counting writing stars", () => {
    const traced = Object.fromEntries(availableLessons(8).map(l => [l.id, { completions: 3, best: .9 }]));
    const saved = readPracticeProgress(JSON.stringify(traced), null);
    expect(saved).toEqual(traced);
    expect(activityComplete(LESSONS[0], saved)).toBe(true);
    expect(activityComplete(LESSONS[1], saved)).toBe(false);
    expect(continuousUnlocked(saved, 8)).toBe(false);
    const verified = readPracticeProgress(JSON.stringify(completeThrough(8)), null);
    expect(continuousUnlocked(verified, 8)).toBe(true);
    const invalid = readPracticeProgress(JSON.stringify({ ...traced, [LESSONS[1].id]: { ...traced[LESSONS[1].id], handwritingVerified: "true" } }), null);
    expect(activityComplete(LESSONS[1], invalid)).toBe(false);
  });
  it("preserves completed character coverage without crediting unrelated activities", () => {
    const old = Object.fromEntries(OLD_LESSONS.map(l => [l.id, { completions: 2, best: .8 }]));
    const migrated = readPracticeProgress(null, JSON.stringify(old));
    expect(Object.keys(migrated).sort()).toEqual(["characters-w1-read", "characters-w1-write", "characters-w2-read", "characters-w2-write"]);
    expect(readPracticeProgress(null, JSON.stringify({ school: { completions: 10, best: 1 } }))).toEqual({});
    const current = completeThrough(4);
    expect(readPracticeProgress(JSON.stringify(current), JSON.stringify(old))).toEqual(current);
    expect(readPracticeProgress("broken", "broken")).toEqual({});
  });
});

describe("adaptive character practice", () => {
  it("tracks reading separately from handwriting and keeps mistakes after leaving a question", () => {
    const read = LESSONS[0], write = LESSONS[1];
    const r = wordKey(read, read.words.find(w => w.hanzi === "一")!);
    const w = wordKey(write, write.words.find(w => w.hanzi === "一")!);
    let history = recordResult({}, r, "correct", 100);
    history = recordResult(history, w, "hint", 101);
    expect(history[r]).toMatchObject({ attempts: 1, successes: 1, misses: 0 });
    expect(history[w]).toMatchObject({ attempts: 1, successes: 0, misses: 1, hints: 1 });
    expect(priority(history[w])).toBeGreaterThan(priority(history[r]));
    expect(parseWordHistory(JSON.stringify(history))).toEqual(history);
    for (let i = 0; i < 8; i++) history = recordResult(history, w, "correct", 102 + i);
    expect(history[w].difficulty).toBeLessThan(.03);
  });
  it("samples difficult characters more often while excluding future content and recent repeats", () => {
    const pool = practicePool(8);
    expect(pool.every(item => item.lesson.week <= 8)).toBe(true);
    expect(new Set(pool.map(item => item.key)).size).toBe(pool.length);
    const difficult = pool[0];
    let history: WordHistory = {};
    history = recordResult(history, difficult.key, "miss", 1);
    history = recordResult(history, difficult.key, "miss", 2);
    const counts: Record<string, number> = {};
    for (let i = 0; i < 10000; i++) {
      const selected = choosePractice(history, 8, [], () => (i + .5) / 10000)!;
      counts[selected.key] = (counts[selected.key] ?? 0) + 1;
    }
    expect(counts[difficult.key]).toBeGreaterThan(counts[pool[1].key] * 5);
    expect(choosePractice(history, 8, [difficult.key], () => 0)!.key).not.toBe(difficult.key);
    expect(choosePractice(history, 0, [])).toBeUndefined();
  });
  it("drops corrupt or unknown history without disabling practice", () => {
    for (const raw of [null, "broken", "[]", "null", '{"read:一":null}']) expect(parseWordHistory(raw)).toEqual({});
    const valid = recordResult({}, "read:一", "miss", 1);
    const loaded = parseWordHistory(JSON.stringify({ ...valid, "read:unknown": valid["read:一"], "write:一": { ...valid["read:一"], difficulty: 50 } }));
    expect(loaded).toEqual(valid);
  });
});
