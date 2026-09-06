import { LESSONS } from "./curriculum";
import type { Progress } from "./game";

export const POLAR_ART = {
  penguin: "/1c/art/penguin.webp",
  ice: "/1c/art/ice-block.webp",
  water: "/1c/art/polar-water.webp",
};

export const ICE_STOPS = LESSONS.map((lesson, index) => ({
  lesson,
  x: index % 2 === 0 ? 28 : 72,
  y: 17 + index * 16,
}));

export const HOP_DURATION_MS = 460;

export function lessonIndex(id: string): number {
  return Math.max(0, LESSONS.findIndex((lesson) => lesson.id === id));
}

export function nextHop(current: number, destination: number): number {
  return current + Math.sign(destination - current);
}

export function nextIceLesson(progress: Progress): string {
  return (LESSONS.find((lesson) => !progress[lesson.id]) ?? LESSONS[LESSONS.length - 1]).id;
}

export function iceRoutePath(): string {
  return ICE_STOPS.reduce((path, stop, index) => {
    if (index === 0) return `M ${stop.x} ${stop.y}`;
    const previous = ICE_STOPS[index - 1];
    const middle = (previous.y + stop.y) / 2;
    return `${path} C ${previous.x} ${middle}, ${stop.x} ${middle}, ${stop.x} ${stop.y}`;
  }, "");
}
