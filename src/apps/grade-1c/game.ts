import { shuffleInPlace } from "../../lib/random";
import { COMPARISONS, NUMBERS, practiceSpeech, type Lesson, type Word } from "./curriculum";

export type Question = { id: string; word: Word; mode: "meaning" | "listen" | "recognize" | "count" | "sound" | "sound-read" | "trace" | "compare" | "order"; options: Word[]; pair?: [number, number]; sequence?: (number | null)[] };

function shuffled<T>(values: T[]): T[] {
  const result = [...values];
  shuffleInPlace(result);
  return result;
}

function makeQuestion(word: Word, mode: Question["mode"], pool: Word[], choices = 3): Question {
  const distractors = shuffled(pool.filter((candidate) => candidate.id !== word.id)).slice(0, choices - 1);
  return { id: `${word.id}-${mode}`, word, mode, options: shuffled([word, ...distractors]) };
}

export function makeRound(lesson: Lesson, listening: boolean): Question[] {
  if (lesson.kind === "sounds") return shuffled(lesson.words).map((word) => makeQuestion(word, listening ? "sound" : "sound-read", lesson.words, 2));
  if (lesson.kind === "writing") return lesson.words.map((word) => makeQuestion(word, "trace", lesson.words, 2));
  if (lesson.kind === "compare") {
    const pairs: [number, number][] = [[5, 2], [1, 4], [3, 3], [10, 6], [0, 2], [0, 0]];
    return shuffled(pairs).map((pair, index) => ({ ...makeQuestion(COMPARISONS[pair[0] > pair[1] ? 0 : pair[0] < pair[1] ? 1 : 2], "compare", COMPARISONS), id: `compare-${index}`, pair }));
  }
  if (lesson.kind === "order") {
    const patterns = [
      { values: [0, 1, 2], gap: 0 }, { values: [2, 3, 4], gap: 1 },
      { values: [4, 5, 6], gap: 1 }, { values: [8, 9, 10], gap: 2 },
      { values: [5, 4, 3], gap: 1 }, { values: [2, 1, 0], gap: 2 },
    ];
    return shuffled(patterns).map(({ values, gap }, index) => ({
      ...makeQuestion(NUMBERS[values[gap]], "order", NUMBERS, 2), id: `order-${index}`,
      sequence: values.map((value, i) => i === gap ? null : value),
    }));
  }
  // One tap per sentence, with only two meanings to choose between.
  if (lesson.kind === "sentences") return shuffled(lesson.words).map((word) => makeQuestion(word, listening ? "listen" : "meaning", lesson.words, 2));
  if (lesson.kind === "numbers") return shuffled(lesson.words).map((word) => makeQuestion(word, "count", lesson.words));
  // Every word gets reading and then listening/recognition practice, without an immediate repeat.
  const first = shuffled(lesson.words);
  const second = shuffled(lesson.words);
  if (second.length > 1 && first.at(-1)?.id === second[0].id) [second[0], second[1]] = [second[1], second[0]];
  return [
    ...first.map((word) => makeQuestion(word, "meaning", lesson.words, lesson.week === 2 ? 2 : 3)),
    ...second.map((word) => makeQuestion(word, listening ? "listen" : "recognize", lesson.words, lesson.week === 2 ? 2 : 3)),
  ];
}

export function questionSpeech(question: Question): string {
  if (question.pair) return `${NUMBERS[question.pair[0]].hanzi}${practiceSpeech(question.word)}${NUMBERS[question.pair[1]].hanzi}`;
  if (question.sequence) return question.sequence.map((value) => NUMBERS[value ?? question.word.value!].hanzi).join("，");
  return practiceSpeech(question.word);
}

export function makeReview(round: Question[], missed: string[]): Question[] {
  return [...new Set(missed)].flatMap((id) => {
    const original = round.find((question) => question.word.id === id);
    return original ? [{ ...original, id: `${original.id}-review` }] : [];
  });
}

export type Progress = Record<string, { completions: number; best: number }>;
// Keep the existing key and Week 1 lesson IDs so adding weeks retains stars.
export const PROGRESS_KEY = "learncn.1c.week1.v1";

export function parseProgress(raw: string | null, lessons: Lesson[]): Progress {
  try {
    const value: unknown = JSON.parse(raw ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const entries = value as Record<string, { completions?: unknown; best?: unknown }>;
    return Object.fromEntries(lessons.flatMap(({ id }) => {
      const item = entries[id];
      if (!item || !Number.isSafeInteger(item.completions) || Number(item.completions) < 1 ||
          typeof item.best !== "number" || !Number.isFinite(item.best) || item.best < 0 || item.best > 1) return [];
      return [[id, { completions: Number(item.completions), best: item.best }]];
    }));
  } catch {
    return {};
  }
}

export function saveCompletion(progress: Progress, id: string, score: number): Progress {
  return { ...progress, [id]: { completions: (progress[id]?.completions ?? 0) + 1, best: Math.max(progress[id]?.best ?? 0, Math.min(1, Math.max(0, score))) } };
}
