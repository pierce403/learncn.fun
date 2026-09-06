import { describe, expect, it } from "vitest";
import { ICE_STOPS, lessonIndex, nextHop, nextIceLesson } from "./ice-path";

describe("penguin lesson path", () => {
  it("places exactly five distinct lessons on a winding path within the water", () => {
    expect(ICE_STOPS.map(({ lesson }) => lesson.id)).toEqual(["school", "greetings", "actions", "friends", "numbers"]);
    for (const [index, stop] of ICE_STOPS.entries()) {
      expect(stop.x).toBeGreaterThan(15);
      expect(stop.x).toBeLessThan(85);
      expect(stop.y).toBeGreaterThan(10);
      expect(stop.y).toBeLessThan(90);
      if (index > 0) {
        expect(stop.x).not.toBe(ICE_STOPS[index - 1].x);
        expect(stop.y).toBeGreaterThan(ICE_STOPS[index - 1].y);
      }
    }
  });

  it("hops one ice block at a time in both directions, then stops", () => {
    for (let from = 0; from < ICE_STOPS.length; from++) {
      for (let to = 0; to < ICE_STOPS.length; to++) {
        let current = from;
        const visited = [current];
        for (let hops = 0; hops < Math.abs(to - from); hops++) {
          const next = nextHop(current, to);
          expect(Math.abs(next - current)).toBe(1);
          current = next;
          visited.push(current);
        }
        expect(current).toBe(to);
        expect(nextHop(current, to)).toBe(to);
        expect(new Set(visited).size).toBe(visited.length);
      }
    }
  });

  it("resumes at the first unfinished lesson without losing existing stars", () => {
    expect(nextIceLesson({})).toBe("school");
    expect(nextIceLesson({ school: { completions: 2, best: 1 }, actions: { completions: 1, best: .5 } })).toBe("greetings");
    const complete = Object.fromEntries(ICE_STOPS.map(({ lesson }) => [lesson.id, { completions: 1, best: 1 }]));
    expect(nextIceLesson(complete)).toBe("numbers");
    expect(lessonIndex("numbers")).toBe(4);
    expect(lessonIndex("obsolete-lesson")).toBe(0);
  });
});
