import { describe, expect, it } from "vitest";
import { LESSONS, practiceSpeech } from "./curriculum";
import { makeRound } from "./game";
import { cardNarration, lessonDirections, lessonNarration, questionNarration, spokenText } from "./narration";

describe("spoken directions for beginning readers", () => {
  it("introduces every island in English before its Mandarin example", () => {
    expect(new Set(LESSONS.map(lessonDirections)).size).toBe(LESSONS.length);
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
