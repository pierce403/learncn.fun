import { describe, expect, it } from "vitest";
import { ICE_MAP_HEIGHT, ICE_STOPS, ICE_WEEKS, lessonIndex, nextHop, nextIceLesson } from "./ice-path";
import { LESSONS, availableLessons } from "./weekly-curriculum";

describe("weekly penguin path", () => {
  it("places two islands per PDF week without overlapping week banners", () => {
    expect(ICE_STOPS).toHaveLength(38); expect(ICE_WEEKS).toHaveLength(19);
    for (const [index, week] of ICE_WEEKS.entries()) {
      expect(week.stops.map(s => s.lesson.kind)).toEqual(["words", "writing"]);
      expect((week.stops[0].y - week.y) * ICE_MAP_HEIGHT / 100).toBeCloseTo(9);
      if (index) expect(week.y).toBeGreaterThan(ICE_WEEKS[index - 1].stops.at(-1)!.y);
    }
    expect((100 - ICE_STOPS.at(-1)!.y) * ICE_MAP_HEIGHT / 100).toBeGreaterThanOrEqual(8);
  });
  it("hops one island at a time", () => {
    expect(nextHop(2, 4)).toBe(3); expect(nextHop(2, 0)).toBe(1); expect(nextHop(2, 2)).toBe(2);
  });
  it("resumes unfinished practice without routing into locked weeks", () => {
    expect(nextIceLesson({}, undefined, 8)).toBe("characters-w1-read");
    const complete = Object.fromEntries(availableLessons(8).map(l => [l.id, { completions: 1, best: 1, handwritingVerified: true as const }]));
    expect(nextIceLesson(complete, undefined, 8)).toBe("characters-w8-write");
    expect(nextIceLesson(complete, "characters-w8-write", 8)).toBe("characters-w8-write");
    expect(nextIceLesson(complete, undefined, 9)).toBe("characters-w9-read");
    delete complete["characters-w1-write"];
    expect(nextIceLesson(complete, "characters-w8-write", 8)).toBe("characters-w1-write");
    expect(lessonIndex("missing")).toBe(0);
    expect(lessonIndex(LESSONS[3].id)).toBe(3);
  });
});
