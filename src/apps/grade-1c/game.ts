import { shuffleInPlace } from "../../lib/random";
import type { Lesson, Word } from "./curriculum";

export type Question = { id: string; word: Word; mode: "meaning" | "listen" | "recognize" | "count"; options: Word[] };

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
  // One tap per sentence, with only two meanings to choose between.
  if (lesson.kind === "sentences") return shuffled(lesson.words).map((word) => makeQuestion(word, listening ? "listen" : "meaning", lesson.words, 2));
  if (lesson.kind === "numbers") return shuffled(lesson.words).map((word) => makeQuestion(word, "count", lesson.words));
  // Every word gets reading and then listening/recognition practice, without an immediate repeat.
  const first = shuffled(lesson.words);
  const second = shuffled(lesson.words);
  if (second.length > 1 && first.at(-1)?.id === second[0].id) [second[0], second[1]] = [second[1], second[0]];
  return [
    ...first.map((word) => makeQuestion(word, "meaning", lesson.words)),
    ...second.map((word) => makeQuestion(word, listening ? "listen" : "recognize", lesson.words)),
  ];
}

export function makeReview(round: Question[], missed: string[]): Question[] {
  return [...new Set(missed)].flatMap((id) => {
    const original = round.find((question) => question.word.id === id);
    return original ? [{ ...original, id: `${original.id}-review` }] : [];
  });
}

export type Progress = Record<string, { completions: number; best: number }>;
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
