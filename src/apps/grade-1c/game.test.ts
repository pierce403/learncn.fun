import { describe, expect, it } from "vitest";
import { ACTIONS, GREETINGS, LESSONS, NUMBERS, SCHOOL, SENTENCES } from "./curriculum";
import { makeReview, makeRound, parseProgress, saveCompletion } from "./game";

describe("Grade 1C Week 1 curriculum", () => {
  it("covers the worksheet's twelve vocabulary words and three sentence patterns", () => {
    expect([...SCHOOL, ...GREETINGS, ...ACTIONS].map((word) => word.hanzi)).toEqual([
      "上学", "老师", "学生", "早安", "午安", "晚安", "起立", "坐下", "举手", "放下", "洗手", "喝水",
    ]);
    expect(SENTENCES.map((word) => word.hanzi)).toEqual(["你好，我叫__。", "请问你叫什么名字？", "我今年__岁了。"]);
    expect(new Set(LESSONS.flatMap((lesson) => lesson.words.map((word) => word.id))).size).toBe(26);
    for (const word of LESSONS.flatMap((lesson) => lesson.words)) {
      expect(word.pinyin).not.toBe("");
      expect(word.english).not.toBe("");
    }
  });

  it("matches every numeral to its Chinese and English number word", () => {
    expect(NUMBERS.map((word) => [word.value, word.hanzi, word.english])).toEqual([
      [0, "零", "zero"], [1, "一", "one"], [2, "二", "two"], [3, "三", "three"], [4, "四", "four"],
      [5, "五", "five"], [6, "六", "six"], [7, "七", "seven"], [8, "八", "eight"], [9, "九", "nine"], [10, "十", "ten"],
    ]);
  });
});

describe("Grade 1C games", () => {
  it("covers every word in both reading and listening, with unique valid choices and no immediate repeat", () => {
    for (let iteration = 0; iteration < 40; iteration++) {
      for (const lesson of LESSONS.filter((lesson) => lesson.kind === "words")) {
        const round = makeRound(lesson, true);
        expect(round).toHaveLength(lesson.words.length * 2);
        for (const word of lesson.words) expect(round.filter((question) => question.word.id === word.id).map((question) => question.mode)).toEqual(["meaning", "listen"]);
        round.forEach((question, index) => {
          expect(new Set(question.options.map((option) => option.id)).size).toBe(3);
          expect(question.options.filter((option) => option.id === question.word.id)).toHaveLength(1);
          if (index > 0) expect(question.word.id).not.toBe(round[index - 1].word.id);
        });
      }
    }
  });

  it("uses written recognition when audio is unavailable or muted", () => {
    const round = makeRound(LESSONS[0], false);
    expect(round.some((question) => question.mode === "listen")).toBe(false);
    expect(round.filter((question) => question.mode === "recognize")).toHaveLength(SCHOOL.length);
  });

  it("builds all three complete sentences from solvable, initially shuffled tiles", () => {
    const round = makeRound(LESSONS[3], true);
    expect(round).toHaveLength(3);
    for (const question of round) {
      const example = question.word.example!;
      expect([...question.tiles].sort()).toEqual([...example.tokens].sort());
      expect(question.tiles).not.toEqual(example.tokens);
      expect(example.tokens.join("")).toBe(example.hanzi.replace(/[，。？]/g, ""));
    }
  });

  it("practices every quantity, including zero and ten", () => {
    const round = makeRound(LESSONS[4], false);
    expect(round.map((question) => question.word.value).sort((a, b) => a! - b!)).toEqual(Array.from({ length: 11 }, (_, i) => i));
    expect(round.every((question) => question.mode === "count")).toBe(true);
  });

  it("reviews each missed or hinted word once without creating an endless review loop", () => {
    const round = makeRound(LESSONS[0], true);
    const review = makeReview(round, ["teacher", "teacher", "student"]);
    expect(review.map((question) => question.word.id)).toEqual(["teacher", "student"]);
    expect(review.every((question) => question.id.endsWith("-review"))).toBe(true);
    expect(makeReview(round, [])).toEqual([]);
  });

  it("keeps completed stars, improves best results, and rejects corrupt saved progress", () => {
    const first = saveCompletion({}, "school", 1);
    const second = saveCompletion(first, "school", .5);
    expect(first.school.completions).toBe(1);
    expect(second.school).toEqual({ completions: 2, best: 1 });
    expect(parseProgress(JSON.stringify(second), LESSONS)).toEqual(second);
    for (const raw of [null, "broken json", "null", "[]", '{"school":null}', '{"school":{"completions":-1,"best":1}}', '{"school":{"completions":1,"best":2}}']) expect(parseProgress(raw, LESSONS)).toEqual({});
    expect(parseProgress('{"unknown":{"completions":1,"best":1}}', LESSONS)).toEqual({});
  });
});
