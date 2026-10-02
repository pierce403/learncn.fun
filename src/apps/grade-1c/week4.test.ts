import { describe, expect, it } from "vitest";
import { LESSONS, WEEK_4_INITIALS, WEEK_4_READING, WEEK_4_WRITING, WEEK_4_LESSONS, practiceSpeech } from "./curriculum";
import { makeRound, makeReview, parseProgress, saveCompletion, questionSpeech } from "./game";
import { cardNarration, lessonDirections, questionNarration } from "./narration";
import { nextIceLesson } from "./ice-path";

describe("Week 4 newsletter and games", () => {
  it("covers the exact published initials and recognition/writing characters once", () => {
    expect(WEEK_4_INITIALS.map(w => w.hanzi)).toEqual(["b", "p", "m", "f", "d", "t", "n", "l"]);
    expect(WEEK_4_READING.map(w => w.hanzi)).toEqual(["马", "巴", "你", "我", "他", "弟", "爸", "她", "妈", "的", "父", "母"]);
    expect(WEEK_4_WRITING.map(w => w.hanzi)).toEqual(["木", "土", "八", "也", "不", "女", "儿"]);
    for (const [kind, words] of [["sounds", WEEK_4_INITIALS], ["words", WEEK_4_READING], ["writing", WEEK_4_WRITING]] as const) {
      expect(WEEK_4_LESSONS.filter(l => l.kind === kind).flatMap(l => l.words).map(w => w.id).sort()).toEqual(words.map(w => w.id).sort());
    }
    for (const word of [...WEEK_4_READING, ...WEEK_4_WRITING]) {
      expect(word.related).toHaveLength(2);
      expect(word.related!.every(w => w.hanzi.includes(word.hanzi))).toBe(true);
      expect(word.sentence?.hanzi).toContain(word.hanzi);
    }
  });

  it("uses Mandarin syllables and mouth cues, with both instruction languages", () => {
    for (const word of WEEK_4_INITIALS) {
      expect(practiceSpeech(word)).toMatch(/^[\p{Script=Han}]+$/u);
      expect(word.pinyin.startsWith(word.hanzi)).toBe(true);
      expect(cardNarration(word).at(-1)).toEqual({ text: word.audioText, language: "zh" });
      expect(cardNarration(word)[0].text).toBe(word.tip);
      expect(cardNarration(word, true, "zh")[0].text).not.toBe("听一听，跟着读。");
    }
    for (const lesson of WEEK_4_LESSONS) {
      expect(lessonDirections(lesson)).not.toContain("Let's learn together!");
      expect(lessonDirections(lesson, "zh")).not.toContain("一起来学中文！");
    }
  });

  it("keeps he/she written and offers two distinct, solvable choices with or without audio", () => {
    for (const lesson of WEEK_4_LESSONS) {
      for (const listening of [true, false]) {
        for (const question of makeRound(lesson, listening)) {
          expect(question.options).toHaveLength(2);
          expect(new Set(question.options.map(w => w.hanzi)).size).toBe(2);
          expect(new Set(question.options.map(w => w.english)).size).toBe(2);
          expect(question.options.filter(w => w.id === question.word.id)).toHaveLength(1);
          if (!listening || ["他", "她"].includes(question.word.hanzi)) expect(question.mode).not.toBe("listen");
        }
      }
    }
    const sentences = WEEK_4_LESSONS.find(l => l.kind === "sentences")!;
    expect(sentences.words).toHaveLength(3);
    expect(sentences.words.every(w => w.hanzi.startsWith("我有"))).toBe(true);
  });

  it("keeps number-line, dice, and story totals within ten and retains their models in review", () => {
    const math = WEEK_4_LESSONS.filter(l => l.kind === "addition");
    expect(math).toHaveLength(3);
    for (const lesson of math) {
      const round = makeRound(lesson, false);
      for (const q of round) {
        const card = lesson.words.find(w => `${w.id}-answer` === q.word.id)!;
        const [left, right] = q.parts!;
        expect(left).toBeGreaterThanOrEqual(0);
        expect(right).toBeGreaterThanOrEqual(0);
        expect(q.word.value).toBe(left + right);
        expect(q.word.value).toBeLessThanOrEqual(10);
        expect(q.mathModel).toBe(card.mathModel);
        expect(q.story).toEqual(card.story);
        if (q.mathModel === "dice") expect(q.parts!.every(v => v >= 1 && v <= 6)).toBe(true);
        for (const language of ["en", "zh"] as const) {
          for (const full of [true, false]) {
            const narration = questionNarration(lesson, q, false, full, language);
            const text = narration.map(segment => segment.text).join("");
            expect(narration.every(segment => segment.language === language)).toBe(true);
            expect(text).not.toContain(questionSpeech(q));
            if (q.story) expect(text).toContain(q.story[language]);
          }
        }
      }
      const review = makeReview(round, round.map(q => q.word.id));
      expect(review.map(q => [q.parts, q.mathModel, q.story])).toEqual(round.map(q => [q.parts, q.mathModel, q.story]));
    }
    const line = makeRound(math[0], false);
    expect(line.some(q => q.parts![0] === 0)).toBe(true);
    expect(line.some(q => q.parts![1] === 0)).toBe(true);
    expect(line.some(q => q.word.value === 10)).toBe(true);
  });

  it("preserves all earlier stars, resumes at Week 4, and saves new completions", () => {
    const earlier = LESSONS.filter(l => l.week < 4);
    const previous = Object.fromEntries(earlier.map(l => [l.id, { completions: 2, best: .75 }]));
    let progress = parseProgress(JSON.stringify(previous), LESSONS);
    expect(nextIceLesson(progress)).toBe(WEEK_4_LESSONS[0].id);
    expect(nextIceLesson(progress, earlier.at(-1)!.id)).toBe(WEEK_4_LESSONS[0].id);
    for (const lesson of WEEK_4_LESSONS) progress = saveCompletion(progress, lesson.id, .5);
    for (const lesson of earlier) expect(progress[lesson.id]).toEqual(previous[lesson.id]);
    expect(Object.keys(progress)).toHaveLength(29);
    expect(parseProgress(JSON.stringify(progress), LESSONS)).toEqual(progress);
    const ids = LESSONS.flatMap(l => l.words.map(w => w.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
