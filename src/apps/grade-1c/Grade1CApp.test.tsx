// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Grade1CApp from "./Grade1CApp";
import type { WritingAttempt, WritingMode } from "./TraceCharacter";
import { availableLessons, LESSONS } from "./weekly-curriculum";
import { PRACTICE_PROGRESS_KEY, WORD_HISTORY_KEY } from "./practice";
const audio = vi.hoisted(() => ({ enabled: true, canListen: true, message: "", play: vi.fn(), narrate: vi.fn(), stop: vi.fn(), toggle: vi.fn() }));
vi.mock("./useLessonAudio", () => ({ useLessonAudio: () => audio }));
vi.mock("../../lib/confetti", () => ({ burstConfetti: vi.fn() }));
vi.mock("../../lib/sfx", () => ({ playDing: vi.fn(), playTada: vi.fn() }));
vi.mock("../../components/PwaInstall", () => ({ PwaInstallPrompt: () => null }));
vi.mock("./TraceCharacter", () => ({ default: ({ hanzi, mode, onComplete, onHelp }: { hanzi: string; mode: WritingMode; onComplete: (result: WritingAttempt) => void; onHelp: (kind: "miss" | "hint") => void }) => <div aria-label={`Draw ${hanzi}`}><span>{mode} pad</span><button onClick={() => onHelp("miss")}>Stroke mistake</button><button onClick={() => onComplete({ assisted: mode === "guided" })}>Finish drawing</button><button onClick={() => onComplete({ assisted: true })}>Finish with help</button></div> }));
beforeEach(() => {
  localStorage.clear(); localStorage.setItem("learncn.read.answerMode", "en"); vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-20T02:47:00Z"));
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  HTMLElement.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.spyOn(Math, "random").mockReturnValue(.4);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks(); vi.useRealTimers(); });
function completeThrough(week: number) { localStorage.setItem(PRACTICE_PROGRESS_KEY, JSON.stringify(Object.fromEntries(availableLessons(week).map(l => [l.id, { completions: 1, best: 1, handwritingVerified: true as const }])))); }
function clickNext() { fireEvent.click(screen.getByRole("button", { name: "Next question" })); }
function answerCurrent() {
  const character = document.querySelector('.one-c-prompt-hanzi')!.textContent;
  const word = LESSONS.flatMap(l => l.words).find(w => w.hanzi === character)!;
  fireEvent.click(within(screen.getByRole("group", { name: "Answer choices" })).getByRole("button", { name: word.english }));
  return word;
}

describe("direct weekly practice", () => {
  it("locks future weeks and continuous play, then opens reading without teaching cards", () => {
    render(<Grade1CApp/>);
    expect((screen.getByRole("button", { name: "Week 9, lesson 1: Read. Locked until this school week." }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: /🔒 Continuous play/ }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Start lesson: Read" }));
    expect(screen.getByRole("heading", { name: "What does this mean?" })).toBeTruthy();
    expect(screen.queryByText("Meet your new words.")).toBeNull();
    expect(screen.queryByRole("navigation", { name: "Choose a week" })).toBeNull();
    expect(audio.narrate).not.toHaveBeenCalled();
    const word = answerCurrent();
    const history = JSON.parse(localStorage.getItem(WORD_HISTORY_KEY)!);
    expect(history[`read:${word.hanzi}`]).toMatchObject({ attempts: 1, successes: 1 });
  });
  it("switches pinyin and English answers in place, preserves mistakes, and remembers the shared preference", () => {
    localStorage.removeItem("learncn.read.answerMode");
    const first = render(<Grade1CApp/>);
    fireEvent.click(screen.getByRole("button", { name: "Start lesson: Read" }));
    expect(screen.getByRole("heading", { name: "How do you read this?" })).toBeTruthy();
    const character = document.querySelector('.one-c-prompt-hanzi')!.textContent!;
    const word = LESSONS[0].words.find(w => w.hanzi === character)!;
    let choices = within(screen.getByRole("group", { name: "Answer choices" }));
    expect(choices.getByRole("button", { name: word.pinyin })).toBeTruthy();
    fireEvent.click(choices.getAllByRole("button").find(b => b.textContent !== word.pinyin)!);
    fireEvent.click(screen.getByRole("button", { name: "Answers CN" }));
    expect(screen.getByRole("heading", { name: "What does this mean?" })).toBeTruthy();
    expect(document.querySelector('.one-c-prompt-hanzi')!.textContent).toBe(character);
    choices = within(screen.getByRole("group", { name: "Answer choices" }));
    expect(choices.getAllByRole("button").filter(b => (b as HTMLButtonElement).disabled)).toHaveLength(1);
    fireEvent.click(choices.getByRole("button", { name: word.english }));
    expect(JSON.parse(localStorage.getItem(WORD_HISTORY_KEY)!)[`read:${character}`]).toMatchObject({ attempts: 1, misses: 1, successes: 0 });
    expect(localStorage.getItem("learncn.read.answerMode")).toBe("en");
    first.unmount(); render(<Grade1CApp/>);
    fireEvent.click(screen.getByRole("button", { name: "Start lesson: Read" }));
    expect(screen.getByRole("button", { name: "Answers EN" })).toBeTruthy();
  });
  it("saves a mistake immediately and does not turn the later retry into a clean answer", () => {
    render(<Grade1CApp/>); fireEvent.click(screen.getByRole("button", { name: "Start lesson: Read" }));
    const character = document.querySelector('.one-c-prompt-hanzi')!.textContent!;
    const word = LESSONS[0].words.find(w => w.hanzi === character)!;
    const buttons = within(screen.getByRole("group", { name: "Answer choices" })).getAllByRole("button");
    fireEvent.click(buttons.find(b => b.textContent !== word.english)!);
    expect(JSON.parse(localStorage.getItem(WORD_HISTORY_KEY)!)[`read:${character}`].misses).toBe(1);
    answerCurrent();
    expect(JSON.parse(localStorage.getItem(WORD_HISTORY_KEY)!)[`read:${character}`]).toMatchObject({ attempts: 1, misses: 1, successes: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Back to the ice path" }));
    expect(screen.getByText("Getting extra practice")).toBeTruthy();
  });
  it("saves a completed reading activity and opens writing directly", async () => {
    render(<Grade1CApp/>); fireEvent.click(screen.getByRole("button", { name: "Start lesson: Read" }));
    for (let i = 0; i < 10; i++) { answerCurrent(); clickNext(); }
    expect(screen.getByRole("heading", { name: "Practice complete!" })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(PRACTICE_PROGRESS_KEY)!)["characters-w1-read"].completions).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: "Map →" }));
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Start lesson: Write" }));
    expect(screen.getByRole("heading", { name: "Trace the character" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Stroke mistake" }));
    fireEvent.click(screen.getByRole("button", { name: "Stroke mistake" }));
    fireEvent.click(screen.getByRole("button", { name: "Finish drawing" }));
    const rows = Object.entries(JSON.parse(localStorage.getItem(WORD_HISTORY_KEY)!)).filter(([key]) => key.startsWith("write:"));
    expect(rows).toHaveLength(1); expect(rows[0][1]).toMatchObject({ attempts: 1, misses: 1, successes: 0 });
  });
  it("requires an unassisted whole character after tracing and after every assisted attempt", () => {
    render(<Grade1CApp/>);
    fireEvent.click(screen.getByRole("button", { name: "Week 1, lesson 2: Write. Ready to play." }));
    fireEvent.click(screen.getByRole("button", { name: "Start lesson: Write" }));
    for (let i = 0; i < 5; i++) {
      expect(screen.getByText("guided pad")).toBeTruthy();
      fireEvent.click(screen.getByRole("button", { name: "Finish drawing" }));
      expect(screen.queryByRole("button", { name: "Next question" })).toBeNull();
      expect(localStorage.getItem(PRACTICE_PROGRESS_KEY)).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Your turn →" }));
      expect(screen.getByText("recall pad")).toBeTruthy();
      if (i === 0) {
        fireEvent.click(screen.getByRole("button", { name: "Stroke mistake" }));
        fireEvent.click(screen.getByRole("button", { name: "Finish drawing" }));
        expect(screen.queryByRole("button", { name: "Next question" })).toBeNull();
        expect(screen.getByText("1 / 5")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: "Try again →" }));
        expect(screen.getByText("recall pad")).toBeTruthy();
      }
      fireEvent.click(screen.getByRole("button", { name: "Finish drawing" }));
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next question" }));
      clickNext();
    }
    expect(screen.getByRole("heading", { name: "Practice complete!" })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(PRACTICE_PROGRESS_KEY)!)["characters-w1-write"]).toMatchObject({ completions: 1, handwritingVerified: true });
    const history = Object.values(JSON.parse(localStorage.getItem(WORD_HISTORY_KEY)!));
    expect(history).toHaveLength(5);
    expect(history).toContainEqual(expect.objectContaining({ attempts: 2, misses: 1, successes: 1 }));
  });
  it("unlocks an endless session after all current activities and rechecks when the next week opens", () => {
    completeThrough(8); render(<Grade1CApp/>);
    fireEvent.click(screen.getByRole("button", { name: "Continuous play →" }));
    expect(screen.getByText("0 practiced")).toBeTruthy();
    if (screen.queryByRole("button", { name: "Finish drawing" })) fireEvent.click(screen.getByRole("button", { name: "Finish drawing" })); else answerCurrent();
    fireEvent.click(screen.getByRole("button", { name: "Next practice question" }));
    expect(screen.getByText("1 practiced")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "End continuous practice" }));
    expect(screen.getByText("1 characters practiced.")).toBeTruthy();
    act(() => { vi.setSystemTime(new Date("2026-10-26T07:00:00Z")); window.dispatchEvent(new Event("focus")); });
    expect((screen.getByRole("button", { name: /🔒 Continuous play/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Week 9, lesson 1: Read. Ready to play." }) as HTMLButtonElement).disabled).toBe(false);
  });
});
