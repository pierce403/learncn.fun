import { describe, expect, it } from "vitest";
import { LESSONS, WEEK_1_LESSONS, WEEK_2_LESSONS, WEEK_3_LESSONS, WEEK_3_GROWNUPS, WEEK_3_SIBLINGS, WEEK_3_FAMILY, WEEK_3_SENTENCES, WEEK_3_MEASURES, practiceSpeech } from "./curriculum";
import { makeReview, makeRound, parseProgress, questionSpeech, saveCompletion } from "./game";
import { questionNarration } from "./narration";

describe("Week 3 newsletter and games", () => {
  it("covers all twelve family terms and the four published sentence patterns", () => {
    expect([...WEEK_3_GROWNUPS, ...WEEK_3_SIBLINGS, ...WEEK_3_FAMILY].map((word) => word.hanzi)).toEqual([
      "爷爷", "奶奶", "爸爸", "妈妈", "哥哥", "姐姐", "弟弟", "妹妹", "家人", "父母", "儿子", "女儿",
    ]);
    expect(WEEK_3_SENTENCES.map((word) => word.hanzi)).toEqual([
      "他是谁？", "他是我的爷爷。", "你家有几个人？", "我家有六个人。",
    ]);
    expect(WEEK_3_LESSONS.filter((lesson) => lesson.kind === "words").every((lesson) => lesson.words.length === 4)).toBe(true);
    for (const listening of [true, false]) {
      const round = makeRound(WEEK_3_LESSONS.find((lesson) => lesson.kind === "sentences")!, listening);
      expect(round).toHaveLength(4);
      expect(new Set(round.map((q) => q.word.hanzi))).toEqual(new Set(WEEK_3_SENTENCES.map((word) => word.hanzi)));
      expect(round.every((q) => q.mode === (listening ? "listen" : "meaning"))).toBe(true);
    }
  });

  it("keeps every new lesson playable without audio, with two distinct choices and one answer", () => {
    for (const lesson of WEEK_3_LESSONS) {
      for (const listening of [true, false]) {
        const round = makeRound(lesson, listening);
        expect(round.length).toBeGreaterThan(0);
        for (const question of round) {
          expect(question.options).toHaveLength(2);
          expect(new Set(question.options.map((word) => word.hanzi)).size).toBe(2);
          expect(question.options.filter((word) => word.id === question.word.id)).toHaveLength(1);
          if (!listening) expect(question.mode).not.toBe("listen");
        }
      }
    }
  });

  it("fills each measure-word gap to form the taught phrase without speaking its answer early", () => {
    const round = makeRound(WEEK_3_LESSONS.find((lesson) => lesson.kind === "measures")!, false);
    expect(round).toHaveLength(4);
    expect(new Set(WEEK_3_MEASURES.map((word) => word.hanzi))).toEqual(new Set(["个", "条", "件", "只"]));
    for (const q of round) {
      expect(q.mode).toBe("measure");
      expect(q.word.measure!.before + q.word.hanzi + q.word.measure!.after).toBe(q.word.example!.hanzi);
      expect(questionSpeech(q)).toBe(q.word.example!.hanzi);
      for (const language of ["en", "zh"] as const) {
        for (const full of [true, false]) {
          const narration = questionNarration(WEEK_3_LESSONS[4], q, false, full, language);
          expect(narration.map((part) => part.text).join("")).not.toContain(practiceSpeech(q.word));
        }
      }
    }
  });

  it("computes missing parts and totals within ten, including zero and the upper boundary", () => {
    const math = WEEK_3_LESSONS.filter((lesson) => lesson.kind === "bonds" || lesson.kind === "addition");
    for (const lesson of math) {
      const round = makeRound(lesson, false);
      expect(new Set(round.map((q) => q.id)).size).toBe(round.length);
      for (const q of round) {
        const [left, right] = q.parts!;
        expect(left).toBeGreaterThanOrEqual(0);
        expect(right).toBeGreaterThanOrEqual(0);
        expect(left + right).toBeLessThanOrEqual(10);
        expect(q.word.value).toBe(lesson.kind === "bonds" ? right : left + right);
        expect(new Set(q.options.map((word) => word.value)).size).toBe(2);
        expect(q.options.every((word) => word.value! >= 0 && word.value! <= 10)).toBe(true);
        expect(questionSpeech(q)).toMatch(/^[\p{Script=Han}]+$/u);
        for (const language of ["en", "zh"] as const) {
          for (const full of [true, false]) {
            const narration = questionNarration(lesson, q, false, full, language);
            expect(narration.every((part) => part.language === language)).toBe(true);
            expect(narration.map((part) => part.text).join("")).not.toContain(questionSpeech(q));
          }
        }
      }
    }
    const addition = makeRound(math.find((lesson) => lesson.kind === "addition")!, false);
    expect(addition.map((q) => q.word.value)).toEqual(expect.arrayContaining([0, 10]));
    const zeroAddend = addition.find((q) => q.parts![0] > 0 && q.parts![1] === 0)!;
    expect(zeroAddend.word.value).toBe(zeroAddend.parts![0]);
  });

  it("reviews distinct missing-part puzzles even when their numeric answers match", () => {
    const round = makeRound(WEEK_3_LESSONS.find((lesson) => lesson.kind === "bonds")!, false);
    const sameAnswer = round.filter((q) => q.word.value === 2);
    expect(sameAnswer).toHaveLength(2);
    const review = makeReview(round, sameAnswer.map((q) => q.word.id));
    expect(review).toHaveLength(2);
    expect(review.map((q) => q.parts)).toEqual(sameAnswer.map((q) => q.parts));
  });

  it("adds Week 3 completion without changing any earlier star or score", () => {
    const previous = Object.fromEntries([...WEEK_1_LESSONS, ...WEEK_2_LESSONS].map((lesson) => [lesson.id, { completions: 2, best: .75 }]));
    let progress = parseProgress(JSON.stringify(previous), LESSONS);
    for (const lesson of WEEK_3_LESSONS) progress = saveCompletion(progress, lesson.id, .5);
    for (const lesson of [...WEEK_1_LESSONS, ...WEEK_2_LESSONS]) expect(progress[lesson.id]).toEqual(previous[lesson.id]);
    expect(Object.keys(progress)).toHaveLength(18);
    expect(parseProgress(JSON.stringify(progress), LESSONS)).toEqual(progress);
    const wordIds = LESSONS.flatMap((lesson) => lesson.words.map((word) => word.id));
    expect(new Set(wordIds).size).toBe(wordIds.length);
  });
});
