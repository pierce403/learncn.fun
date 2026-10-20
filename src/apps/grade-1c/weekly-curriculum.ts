import lists from "./character-lists.json";
import metadata from "./character-metadata.json";
import type { Lesson, Word } from "./curriculum";

// One textbook chapter per school week, as requested by the owner. School week 1
// began September 1, 2026; later weeks open on Monday in the school's time zone.
export const SCHOOL_TIME_ZONE = "America/Los_Angeles";
const FIRST_MONDAY = Date.UTC(2026, 7, 31);
const DAY = 86_400_000;
const characters: Record<string, { pinyin: string; english: string }> = metadata;

function makeWords(text: string): Word[] {
  return Array.from(text, hanzi => ({
    id: `char-${hanzi.codePointAt(0)!.toString(16)}`, hanzi, ...characters[hanzi],
    icon: "", tip: "",
    meaningGroup: ["爸父", "妈母", "哥兄", "子儿孩童", "房屋", "图画"].find(group => group.includes(hanzi)),
  }));
}

export const WEEKS = lists.map(({ week, recognition, writing }) => {
  const monday = new Date(FIRST_MONDAY + (week - 1) * 7 * DAY);
  const start = week === 1 ? new Date(Date.UTC(2026, 8, 1)) : monday;
  const end = new Date(monday.getTime() + 4 * DAY);
  const dateLabel = (date: Date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
  const lessons: Lesson[] = [
    { id: `characters-w${week}-read`, week, title: "Read", chinese: recognition.slice(0, 4).split("").join(" "), description: `${recognition.length} characters to recognize`, color: "cyan", icon: "📖", words: makeWords(recognition), kind: "words" },
    { id: `characters-w${week}-write`, week, title: "Write", chinese: writing.slice(0, 4).split("").join(" "), description: `${writing.length} characters to write`, color: "green", icon: "✏️", words: makeWords(writing), kind: "writing" },
  ];
  return { number: week, title: `Chapter ${week}`, opens: start.toISOString().slice(0, 10), dates: `${dateLabel(start)}–${dateLabel(end)}`, lessons };
});

export const LESSONS = WEEKS.flatMap(week => week.lessons);

export function currentSchoolWeek(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: SCHOOL_TIME_ZONE, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  const part = (type: string) => Number(parts.find(p => p.type === type)!.value);
  const date = Date.UTC(part("year"), part("month") - 1, part("day"));
  if (date < Date.UTC(2026, 8, 1)) return 0;
  return Math.min(WEEKS.length, Math.floor((date - FIRST_MONDAY) / (7 * DAY)) + 1);
}

export function availableLessons(currentWeek: number): Lesson[] {
  return LESSONS.filter(lesson => lesson.week <= currentWeek);
}
