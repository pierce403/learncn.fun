import { LESSONS, WEEKS } from "./curriculum";
import type { Progress } from "./game";

export const POLAR_ART = {
  penguin: "/1c/art/penguin.webp",
  ice: "/1c/art/ice-block.webp",
  water: "/1c/art/polar-water.webp",
};

// Reserve room for a week banner, the penguin, and generously spaced islands.
export const ICE_MAP_HEIGHT = WEEKS.reduce((height, week) => height + week.lessons.length * 8 + 13, 0);
export const ICE_WEEKS = WEEKS.map((week, index) => {
  const offset = WEEKS.slice(0, index).reduce((height, previous) => height + previous.lessons.length * 8 + 13, 0);
  return { ...week, y: (offset + 3) / ICE_MAP_HEIGHT * 100, stops: week.lessons.map((lesson, lessonNumber) => ({
    lesson, lessonNumber: lessonNumber + 1,
    x: lessonNumber % 2 === 0 ? 28 : 72,
    y: (offset + 12 + lessonNumber * 8) / ICE_MAP_HEIGHT * 100,
  })) };
});
export const ICE_STOPS = ICE_WEEKS.flatMap((week) => week.stops);

export const HOP_DURATION_MS = 460;

export function lessonIndex(id: string): number {
  return Math.max(0, LESSONS.findIndex((lesson) => lesson.id === id));
}

export function nextHop(current: number, destination: number): number {
  return current + Math.sign(destination - current);
}

export function nextIceLesson(progress: Progress, afterId?: string): string {
  const start = afterId ? lessonIndex(afterId) + 1 : 0;
  const candidates = [...LESSONS.slice(start), ...LESSONS.slice(0, start)];
  return (candidates.find((lesson) => !progress[lesson.id]) ?? LESSONS[LESSONS.length - 1]).id;
}

export function iceRoutePath(stops = ICE_STOPS): string {
  return stops.reduce((path, stop, index) => {
    if (index === 0) return `M ${stop.x} ${stop.y}`;
    const previous = stops[index - 1];
    const middle = (previous.y + stop.y) / 2;
    return `${path} C ${previous.x} ${middle}, ${stop.x} ${middle}, ${stop.x} ${stop.y}`;
  }, "");
}
