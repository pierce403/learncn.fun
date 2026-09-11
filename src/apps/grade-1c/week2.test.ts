import { describe, expect, it } from "vitest";
import { FINALS, INITIALS, LESSONS, WEEK_1_LESSONS, WEEK_2_LESSONS, WEEK_2_READING, WEEK_2_WRITING, practiceSpeech } from "./curriculum";
import { makeRound, parseProgress, PROGRESS_KEY, questionSpeech, saveCompletion } from "./game";

describe("Week 2 newsletter coverage", () => {
  it("covers the exact pinyin and character lists, keeping character examples optional", () => {
    expect(FINALS.map((word) => word.hanzi)).toEqual(["a", "o", "e", "i", "u", "ü", "er"]);
    expect(INITIALS.map((word) => word.hanzi)).toEqual(["y", "w"]);
    expect(WEEK_2_READING.map((word) => word.hanzi)).toEqual(["衣", "鱼", "雨", "耳", "牙"]);
    expect(WEEK_2_WRITING.map((word) => word.hanzi)).toEqual(["一", "二", "五", "口", "人"]);
    for (const word of [...WEEK_2_READING, ...WEEK_2_WRITING]) {
      expect(word.related).toHaveLength(2);
      expect(word.sentence?.hanzi).toBeTruthy();
      expect(word.sentence?.hanzi).not.toContain("有有");
      expect(practiceSpeech(word)).toBe(word.hanzi);
    }
  });

  it("uses Mandarin syllables for pinyin audio and two choices with or without sound", () => {
    for (const lesson of WEEK_2_LESSONS.filter((lesson) => lesson.kind === "sounds")) {
      for (const listening of [true, false]) {
        const round = makeRound(lesson, listening);
        expect(new Set(round.map((q) => q.word.id))).toEqual(new Set(lesson.words.map((word) => word.id)));
        for (const q of round) {
          expect(q.mode).toBe(listening ? "sound" : "sound-read");
          expect(q.options).toHaveLength(2);
          expect(q.options.filter((word) => word.id === q.word.id)).toHaveLength(1);
          expect(q.word.soundCue).toBeTruthy();
          expect(practiceSpeech(q.word)).toMatch(/^[\p{Script=Han}]+$/u);
        }
      }
    }
  });

  it("traces each writing character once, starting with the simplest strokes", () => {
    const round = makeRound(WEEK_2_LESSONS.find((lesson) => lesson.kind === "writing")!, true);
    expect(round.map((q) => q.word.hanzi)).toEqual(["一", "二", "五", "口", "人"]);
    for (const q of round) {
      expect(q.mode).toBe("trace");
      expect(q.options).toHaveLength(2);
      expect(q.options.filter((word) => word.id === q.word.id)).toHaveLength(1);
    }
  });

  it("compares numbers correctly across all three relations, including zero and ten", () => {
    const round = makeRound(WEEK_2_LESSONS.find((lesson) => lesson.kind === "compare")!, false);
    expect(round).toHaveLength(6);
    expect(new Set(round.map((q) => q.word.hanzi))).toEqual(new Set([">", "<", "="]));
    expect(round.flatMap((q) => q.pair!)).toContain(0);
    expect(round.flatMap((q) => q.pair!)).toContain(10);
    for (const q of round) {
      const [left, right] = q.pair!;
      expect(q.word.hanzi).toBe(left > right ? ">" : left < right ? "<" : "=");
      expect(new Set(q.options.map((word) => word.hanzi))).toEqual(new Set([">", "<", "="]));
      expect(questionSpeech(q)).toMatch(/^[\p{Script=Han}]+$/u);
    }
  });

  it("offers one correct missing number in ascending and descending sequences", () => {
    const round = makeRound(WEEK_2_LESSONS.find((lesson) => lesson.kind === "order")!, false);
    expect(round).toHaveLength(6);
    const directions = new Set<number>();
    for (const q of round) {
      expect(q.sequence!.filter((n) => n === null)).toHaveLength(1);
      const filled = q.sequence!.map((value) => value ?? q.word.value!);
      const step = filled[1] - filled[0];
      expect(Math.abs(step)).toBe(1);
      expect(filled[2] - filled[1]).toBe(step);
      directions.add(step);
      expect(filled.every((value) => value >= 0 && value <= 10)).toBe(true);
      expect(new Set(q.options.map((word) => word.value)).size).toBe(2);
      expect(q.options.filter((word) => word.value === q.word.value)).toHaveLength(1);
      expect(questionSpeech(q)).toMatch(/^[\p{Script=Han}，]+$/u);
    }
    expect(directions).toEqual(new Set([1, -1]));
    expect(round.map((q) => q.word.value)).toEqual(expect.arrayContaining([0, 10]));
  });

  it("retains every saved Week 1 star and adds Week 2 progress independently", () => {
    expect(PROGRESS_KEY).toBe("learncn.1c.week1.v1");
    const old = Object.fromEntries(WEEK_1_LESSONS.map((lesson) => [lesson.id, { completions: 3, best: .75 }]));
    const restored = parseProgress(JSON.stringify(old), LESSONS);
    expect(restored).toEqual(old);
    const updated = saveCompletion(restored, "w2-finals", 1);
    for (const lesson of WEEK_1_LESSONS) expect(updated[lesson.id]).toEqual(old[lesson.id]);
    expect(updated["w2-finals"]).toEqual({ completions: 1, best: 1 });
    expect(parseProgress(JSON.stringify(updated), LESSONS)).toEqual(updated);
    expect(new Set(LESSONS.map((lesson) => lesson.id)).size).toBe(LESSONS.length);
  });
});
