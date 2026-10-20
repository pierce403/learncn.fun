import { LESSONS as OLD_LESSONS, type Lesson, type Word } from "./curriculum";
import { parseProgress, type Progress, type Question } from "./game";
import { availableLessons, LESSONS } from "./weekly-curriculum";

export const PRACTICE_PROGRESS_KEY = "learncn.1c.characters.v1";
export const WORD_HISTORY_KEY = "learncn.1c.word-history.v1";
export type Skill = "read" | "write";
export type WordResult = { attempts: number; successes: number; misses: number; hints: number; streak: number; difficulty: number; lastSeen: number };
export type WordHistory = Record<string, WordResult>;
export type PracticeItem = { lesson: Lesson; word: Word; key: string };

export function skillFor(lesson: Lesson): Skill { return lesson.kind === "writing" ? "write" : "read"; }
export function wordKey(lesson: Lesson, word: Word): string { return `${skillFor(lesson)}:${word.hanzi}`; }

// Keep the old save untouched. Credit a new activity only when old completed
// character activities cover every character required by its PDF list.
export function readPracticeProgress(raw: string | null, legacyRaw: string | null): Progress {
  if (raw !== null) return parseProgress(raw, LESSONS);
  const legacy = parseProgress(legacyRaw, OLD_LESSONS);
  const known = { read: new Set<string>(), write: new Set<string>() };
  for (const lesson of OLD_LESSONS) {
    if (!legacy[lesson.id] || !["words", "writing", "numbers"].includes(lesson.kind)) continue;
    for (const word of lesson.words) if (/^\p{Script=Han}$/u.test(word.hanzi)) {
      known.read.add(word.hanzi);
      if (lesson.kind === "writing") known.write.add(word.hanzi);
    }
  }
  return Object.fromEntries(LESSONS.filter(lesson => lesson.words.every(word => known[skillFor(lesson)].has(word.hanzi)))
    .map(lesson => [lesson.id, { completions: 1, best: 0 }]));
}

export function continuousUnlocked(progress: Progress, currentWeek: number): boolean {
  const available = availableLessons(currentWeek);
  return available.length > 0 && available.every(lesson => (progress[lesson.id]?.completions ?? 0) > 0);
}

export function parseWordHistory(raw: string | null): WordHistory {
  try {
    const value: unknown = JSON.parse(raw ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const allowed = new Set(LESSONS.flatMap(l => l.words.map(w => wordKey(l, w))));
    return Object.fromEntries(Object.entries(value).filter(([key, row]) => {
      if (!allowed.has(key) || !row || typeof row !== "object" || Array.isArray(row)) return false;
      const r = row as WordResult;
      return [r.attempts, r.successes, r.misses, r.hints, r.streak].every(n => Number.isSafeInteger(n) && n >= 0 && n <= 1_000_000)
        && r.attempts === r.successes + r.misses && r.hints <= r.misses && r.streak <= r.successes
        && Number.isFinite(r.difficulty) && r.difficulty >= 0 && r.difficulty <= 1
        && Number.isFinite(r.lastSeen) && r.lastSeen >= 0;
    }));
  } catch { return {}; }
}

export function recordResult(history: WordHistory, key: string, outcome: "correct" | "miss" | "hint", now = Date.now()): WordHistory {
  const old = history[key] ?? { attempts: 0, successes: 0, misses: 0, hints: 0, streak: 0, difficulty: 0, lastSeen: 0 };
  const correct = outcome === "correct";
  return { ...history, [key]: {
    attempts: old.attempts + 1, successes: old.successes + Number(correct),
    misses: old.misses + Number(!correct), hints: old.hints + Number(outcome === "hint"),
    streak: correct ? old.streak + 1 : 0,
    difficulty: correct ? old.difficulty * .65 : Math.min(1, old.difficulty + .5), lastSeen: now,
  } };
}

export function practicePool(currentWeek: number): PracticeItem[] {
  const unique = new Map<string, PracticeItem>();
  for (const lesson of availableLessons(currentWeek)) for (const word of lesson.words) {
    const key = wordKey(lesson, word);
    if (!unique.has(key)) unique.set(key, { lesson, word, key });
  }
  return [...unique.values()];
}

export function priority(result?: WordResult): number {
  return result ? 1 + result.difficulty * 12 + (result.streak === 0 && result.misses > 0 ? 2 : 0) : 2;
}

export function choosePractice(history: WordHistory, currentWeek: number, recent: string[], random = Math.random): PracticeItem | undefined {
  const pool = practicePool(currentWeek);
  const fresh = pool.filter(item => !recent.slice(-3).includes(item.key));
  const candidates = fresh.length ? fresh : pool;
  if (!candidates.length) return undefined;
  let target = random() * candidates.reduce((sum, item) => sum + priority(history[item.key]), 0);
  for (const item of candidates) { target -= priority(history[item.key]); if (target < 0) return item; }
  return candidates.at(-1);
}

function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}

export function practiceQuestion(lesson: Lesson, word: Word, id: string, random = Math.random): Question {
  // Written character -> meaning avoids confusing homophones such as 他 / 她.
  // Writing fallbacks show characters, so identical English meanings are excluded too.
  const seen = new Set([word.english]);
  const distractors = shuffled(lesson.words, random).filter(other => {
    if (other.id === word.id || seen.has(other.english) || (word.meaningGroup && word.meaningGroup === other.meaningGroup)) return false;
    seen.add(other.english); return true;
  }).slice(0, 2);
  return { id, word, mode: lesson.kind === "writing" ? "trace" : "meaning", options: shuffled([word, ...distractors], random) };
}

export function practiceRound(lesson: Lesson, random = Math.random): Question[] {
  return shuffled(lesson.words, random).map((word, i) => practiceQuestion(lesson, word, `${lesson.id}-${i}`, random));
}
