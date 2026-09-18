import { describe, expect, it } from "vitest";
import { ICE_MAP_HEIGHT, ICE_STOPS, ICE_WEEKS, lessonIndex, nextHop, nextIceLesson } from "./ice-path";
import { LESSONS, WEEK_1_LESSONS, WEEK_2_LESSONS, WEEK_3_LESSONS } from "./curriculum";

describe("penguin lesson path", () => {
  it("keeps prior islands and adds seven Week 3 islands within the water", () => {
    expect(ICE_STOPS.slice(0, 5).map(({ lesson }) => lesson.id)).toEqual(["school", "greetings", "actions", "friends", "numbers"]);
    expect(ICE_STOPS.slice(5, 11).map(({ lesson }) => lesson.id)).toEqual(WEEK_2_LESSONS.map((lesson) => lesson.id));
    expect(ICE_STOPS.slice(11).map(({ lesson }) => lesson.id)).toEqual(WEEK_3_LESSONS.map((lesson) => lesson.id));
    expect(new Set(ICE_STOPS.map(({ lesson }) => lesson.id)).size).toBe(18);
    for (const [index, stop] of ICE_STOPS.entries()) {
      expect(stop.x).toBeGreaterThan(15);
      expect(stop.x).toBeLessThan(85);
      expect(stop.y * ICE_MAP_HEIGHT / 100).toBeGreaterThanOrEqual(12);
      expect((100 - stop.y) * ICE_MAP_HEIGHT / 100).toBeGreaterThanOrEqual(8);
      if (index > 0) {
        if (stop.lesson.week === ICE_STOPS[index - 1].lesson.week) expect(stop.x).not.toBe(ICE_STOPS[index - 1].x);
        expect(stop.y).toBeGreaterThan(ICE_STOPS[index - 1].y);
      }
    }
  });

  it("reserves a clear gap and a separate banner before each week", () => {
    for (const [index, week] of ICE_WEEKS.entries()) {
      expect(week.y).toBeLessThan(week.stops[0].y);
      expect((week.stops[0].y - week.y) * ICE_MAP_HEIGHT / 100).toBeCloseTo(9);
      expect(week.stops.map((stop) => stop.lessonNumber)).toEqual(week.lessons.map((_, i) => i + 1));
      if (index) expect(week.y).toBeGreaterThan(ICE_WEEKS[index - 1].stops.at(-1)!.y);
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
    expect(nextIceLesson(complete)).toBe(LESSONS.at(-1)!.id);
    const weekOneComplete = Object.fromEntries(WEEK_1_LESSONS.map((lesson) => [lesson.id, { completions: 2, best: .8 }]));
    expect(nextIceLesson(weekOneComplete)).toBe("w2-finals");
    expect(nextIceLesson(weekOneComplete, "numbers")).toBe("w2-finals");
    expect(nextIceLesson({}, "w2-reading")).toBe("w2-writing");
    const earlierWeeks = Object.fromEntries([...WEEK_1_LESSONS, ...WEEK_2_LESSONS].map((lesson) => [lesson.id, { completions: 1, best: 1 }]));
    expect(nextIceLesson(earlierWeeks)).toBe("w3-grownups");
    expect(nextIceLesson(earlierWeeks, "w2-order")).toBe("w3-grownups");
    expect(lessonIndex("numbers")).toBe(4);
    expect(lessonIndex("obsolete-lesson")).toBe(0);
  });
});
