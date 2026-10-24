import { describe, expect, it } from "vitest";
import lists from "./character-lists.json";
import { availableLessons, currentSchoolWeek, LESSONS, WEEKS } from "./weekly-curriculum";
import { readingWord } from "./reading-vocabulary";
import { practiceRound } from "./practice";

describe("full Grade 1 character sheet", () => {
  it("preserves all 19 rows, including repeated recognition and joined writing characters", () => {
    expect(WEEKS).toHaveLength(19);
    expect(LESSONS).toHaveLength(38);
    const read = WEEKS.flatMap(w => w.lessons[0].words.map(word => word.hanzi));
    const write = WEEKS.flatMap(w => w.lessons[1].words.map(word => word.hanzi));
    expect(read).toHaveLength(364);
    expect(new Set(read).size).toBe(362);
    expect(write).toHaveLength(167);
    expect(new Set(write).size).toBe(167);
    expect(write.every(c => read.includes(c))).toBe(true);
    expect(lists[0].recognition).toBe("衣鱼雨一二五耳牙口人");
    expect(lists[2].writing).toBe("力禾几七个可去");
    expect(lists[13].writing).toBe("是皮衣和里尺还自己好");
    expect(lists[16].writing).toBe("昨明给快乐没有这老师每");
    expect(lists[18].recognition).toBe("组屋公校场商店梯扶常球步图习伙伴游拍兴戏");
    for (const lesson of LESSONS) for (const word of lesson.words) {
      expect(word.hanzi).toMatch(/^\p{Script=Han}$/u);
      expect(word.pinyin).toBeTruthy(); expect(word.english).toBeTruthy();
      expect(word.audioText).toBeUndefined(); expect(word.example).toBeUndefined();
    }
  });
  it("uses full family words for reading while retaining single-character writing and saved keys", () => {
    const forms = { 爸: "爸爸", 妈: "妈妈", 哥: "哥哥", 姐: "姐姐", 弟: "弟弟", 妹: "妹妹", 爷: "爷爷", 奶: "奶奶", 叔: "叔叔" };
    for (const [character, full] of Object.entries(forms)) {
      const original = { ...LESSONS[0].words[0], hanzi: character };
      expect(readingWord(original).hanzi).toBe(full);
      expect(readingWord(original).id).toBe(original.id);
      expect(original.hanzi).toBe(character);
    }
    for (const lesson of LESSONS) for (const q of practiceRound(lesson, () => .4)) {
      const answer = q.options.find(w => w.id === q.word.id)!;
      expect(answer).toEqual(lesson.kind === "writing" ? q.word : readingWord(q.word));
    }
    const grandma = LESSONS.flatMap(l => l.words).find(w => w.hanzi === "奶")!;
    expect(readingWord(grandma)).toMatchObject({ hanzi: "奶奶", pinyin: "nǎinai", english: "grandma", icon: "👵" });
  });
  it("uses Pacific calendar weeks, including Monday and daylight-saving boundaries", () => {
    expect(currentSchoolWeek(new Date("2026-09-01T06:59:59Z"))).toBe(0);
    expect(currentSchoolWeek(new Date("2026-09-01T07:00:00Z"))).toBe(1);
    expect(currentSchoolWeek(new Date("2026-09-07T06:59:59Z"))).toBe(1);
    expect(currentSchoolWeek(new Date("2026-09-07T07:00:00Z"))).toBe(2);
    expect(currentSchoolWeek(new Date("2026-10-19T07:00:00Z"))).toBe(8);
    expect(currentSchoolWeek(new Date("2026-10-20T02:47:00Z"))).toBe(8);
    expect(currentSchoolWeek(new Date("2026-11-02T07:59:59Z"))).toBe(9);
    expect(currentSchoolWeek(new Date("2026-11-02T08:00:00Z"))).toBe(10);
    expect(currentSchoolWeek(new Date("2027-07-01T12:00:00Z"))).toBe(19);
    expect(availableLessons(8).map(l => l.week)).toEqual([1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8]);
  });
  it("starts with practice questions and keeps each character's alternatives solvable", () => {
    for (const lesson of LESSONS) {
      const questions = practiceRound(lesson, () => .4);
      expect(new Set(questions.map(q => q.word.id)).size).toBe(lesson.words.length);
      expect(questions.every(q => q.mode === (lesson.kind === "writing" ? "trace" : "meaning"))).toBe(true);
      for (const q of questions) {
        expect(q.options).toHaveLength(3);
        expect(q.options.filter(w => w.id === q.word.id)).toHaveLength(1);
        expect(new Set(q.options.map(w => w.english)).size).toBe(3);
        expect(new Set(q.options.map(w => w.pinyin.normalize("NFC").trim().toLowerCase())).size).toBe(3);
        if (q.word.meaningGroup) expect(q.options.filter(w => w.meaningGroup === q.word.meaningGroup)).toHaveLength(1);
      }
    }
  });
});
