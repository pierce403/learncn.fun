import { describe, expect, it } from "vitest";
import { LESSONS, practiceSpeech } from "./curriculum";
import { makeRound } from "./game";
import { parseInstructionLanguage, comparisonHintNarration, cardNarration, lessonDirections, lessonNarration, questionNarration, spokenText } from "./narration";

describe("spoken directions for beginning readers", () => {
  it("defaults to English and restores only a valid Mandarin preference", () => {
    expect(parseInstructionLanguage("zh")).toBe("zh");
    for (const value of [null, "en", "", "invalid"]) expect(parseInstructionLanguage(value)).toBe("en");
  });

  it("has Mandarin introductions and card guidance for every lesson", () => {
    expect(new Set(LESSONS.map((lesson) => lessonDirections(lesson, "zh"))).size).toBe(LESSONS.length);
    for (const lesson of LESSONS) {
      const opening = lessonNarration(lesson, lesson.words[0], "zh");
      expect(opening[0]).toEqual({ text: lessonDirections(lesson, "zh"), language: "zh" });
      for (const word of lesson.words) {
        const parts = cardNarration(word, true, "zh");
        expect(parts.every((part) => part.language === "zh")).toBe(true);
        expect(parts[0].text).not.toBe("听一听，跟着读。");
        expect(parts.at(-1)?.text).toBe(practiceSpeech(word));
        expect(parts.map((part) => part.text).join("")).not.toMatch(/[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ]/);
      }
    }
  });

  it("localizes full and brief game directions without translating away recognition targets", () => {
    for (const lesson of LESSONS) {
      for (const question of [...makeRound(lesson, true), ...makeRound(lesson, false)]) {
        for (const full of [true, false]) {
          const parts = questionNarration(lesson, question, false, full, "zh");
          expect(parts[0].language).toBe("zh");
          if (question.mode === "recognize") {
            expect(parts.at(-1)).toEqual({ text: question.word.english, language: "en" });
            expect(parts.map((part) => part.text).join("")).not.toContain(practiceSpeech(question.word));
          } else expect(parts.every((part) => part.language === "zh")).toBe(true);
          if (!full && ["meaning", "listen", "sound", "trace"].includes(question.mode)) {
            expect(parts).toEqual([{ text: practiceSpeech(question.word), language: "zh" }]);
          }
          if (!full && ["count", "compare", "order", "sound-read"].includes(question.mode)) expect(parts[0].text.length).toBeLessThanOrEqual(16);
        }
      }
    }
    const lesson = LESSONS.find((item) => item.kind === "writing")!;
    const question = makeRound(lesson, true)[0];
    const fallback = questionNarration(lesson, question, true, true, "zh");
    expect(fallback[0].language).toBe("zh");
    expect(fallback.at(-1)).toEqual({ text: question.word.english, language: "en" });
  });
  it("translates all three Chinese comparison choices only in the hint narration", () => {
    expect(comparisonHintNarration()).toEqual([
      { text: "大于", language: "zh" }, { text: "More", language: "en" },
      { text: "小于", language: "zh" }, { text: "Less", language: "en" },
      { text: "等于", language: "zh" }, { text: "Same", language: "en" },
    ]);
  });
  it("plays only Mandarin on later listening questions while preserving full directions for replay", () => {
    for (const lesson of LESSONS) {
      for (const question of makeRound(lesson, true).filter((item) => ["meaning", "listen", "sound", "trace"].includes(item.mode))) {
        expect(questionNarration(lesson, question, false, false)).toEqual([
          { text: practiceSpeech(question.word), language: "zh" },
        ]);
        expect(questionNarration(lesson, question)[0].language).toBe("en");
      }
    }
  });

  it("keeps later visual questions short without repeating speaker instructions or revealing answers", () => {
    for (const lesson of LESSONS) {
      for (const question of makeRound(lesson, false).filter((item) => ["count", "compare", "order", "recognize", "sound-read"].includes(item.mode))) {
        const prompt = questionNarration(lesson, question, false, false);
        expect(prompt.every((part) => part.language === "en")).toBe(true);
        const text = prompt.map((part) => part.text).join(" ");
        expect(text.split(/\s+/).length).toBeLessThanOrEqual(7);
        expect(text).not.toMatch(/speaker|listen to|tap/i);
        expect(text).not.toContain(practiceSpeech(question.word));
      }
    }
  });

  it("introduces every island in English before its Mandarin example", () => {
    expect(new Set(LESSONS.map((lesson) => lessonDirections(lesson))).size).toBe(LESSONS.length);
    for (const lesson of LESSONS) {
      const narration = lessonNarration(lesson);
      expect(narration[0]).toEqual({ text: lessonDirections(lesson), language: "en" });
      expect(narration.at(-1)).toEqual({ text: practiceSpeech(lesson.words[0]), language: "zh" });
      expect(narration[0].text.split(/\s+/).length).toBeLessThan(35);
    }
  });

  it("never sends Hanzi, tone-marked pinyin, or the Chinese example name to an English voice", () => {
    for (const lesson of LESSONS) {
      for (const word of lesson.words) {
        const narration = cardNarration(word);
        for (const part of narration.filter((part) => part.language === "en")) {
          expect(part.text).not.toMatch(/[\p{Script=Han}āáǎàēéěèīíǐìōóǒòūúǔùüǖǘǚǜ]|Xiaoming/u);
        }
        expect(narration.at(-1)).toEqual({ text: practiceSpeech(word), language: "zh" });
      }
    }
    expect(spokenText("My name is Xiaoming.")).toContainEqual({ text: "小明", language: "zh" });
  });

  it("explains every game mode without saying the answers to math or recognition questions", () => {
    for (const lesson of LESSONS) {
      for (const question of [...makeRound(lesson, true), ...makeRound(lesson, false)]) {
        const narration = questionNarration(lesson, question);
        expect(narration[0].language).toBe("en");
        expect(narration[0].text).toBeTruthy();
        if (["count", "compare", "order", "recognize"].includes(question.mode)) {
          expect(narration.every((part) => part.language === "en")).toBe(true);
          expect(narration.map((part) => part.text).join(" ")).not.toContain(practiceSpeech(question.word));
        }
      }
    }
    const writing = LESSONS.find((lesson) => lesson.kind === "writing")!;
    expect(questionNarration(writing, makeRound(writing, true)[0], true)).toEqual([
      { text: "Tap the Chinese word for One.", language: "en" },
    ]);
  });
});
