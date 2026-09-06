import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isSpeechSupported, speakChineseSequence, speakEnglishSequence, stopSpeech } from "./speech";

class FakeUtterance {
  text: string;
  lang = "";
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  volume = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: SpeechSynthesisErrorCode }) => void) | null = null;
  constructor(text: string) { this.text = text; }
}

function voice(lang: string, name = lang): SpeechSynthesisVoice {
  return { lang, name, default: false, localService: true, voiceURI: name };
}

describe("shared speech playback", () => {
  let voices: SpeechSynthesisVoice[];
  let spoken: FakeUtterance[];
  let events: EventTarget;
  let synth: { getVoices: () => SpeechSynthesisVoice[]; speak: ReturnType<typeof vi.fn>; cancel: ReturnType<typeof vi.fn>; addEventListener: EventTarget["addEventListener"]; removeEventListener: EventTarget["removeEventListener"] };

  beforeEach(() => {
    vi.useFakeTimers();
    voices = [voice("en-US")];
    spoken = [];
    events = new EventTarget();
    synth = {
      getVoices: () => voices,
      speak: vi.fn((utterance: FakeUtterance) => spoken.push(utterance)),
      cancel: vi.fn(),
      addEventListener: events.addEventListener.bind(events),
      removeEventListener: events.removeEventListener.bind(events),
    };
    vi.stubGlobal("window", { speechSynthesis: synth, setInterval, clearInterval, setTimeout, clearTimeout });
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  });

  afterEach(() => { stopSpeech(); vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("requests Mandarin even when the browser advertises only English", async () => {
    expect(isSpeechSupported()).toBe(true);
    await speakChineseSequence(["老师"]);
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toMatchObject({ text: "老师", lang: "zh-CN", voice: null });
  });

  it("lets the browser resolve English when no English voice is listed", async () => {
    voices = [voice("zh-CN")];
    await speakEnglishSequence(["Teacher"]);
    expect(spoken[0]).toMatchObject({ text: "Teacher", lang: "en-US", voice: null });
  });

  it("prefers the same Mainland Mandarin voice across apps and keeps slow playback", async () => {
    voices = [voice("en-US"), voice("zh-HK", "Cantonese"), voice("zh-TW"), voice("cmn-Hans-CN", "Mandarin")];
    await speakChineseSequence(["早安"], { rate: 0.65 });
    expect(spoken[0].voice).toBe(voices[3]);
    expect(spoken[0].rate).toBe(0.65);
  });

  it("waits for initially empty voice lists to populate", async () => {
    voices = [];
    const playing = speakChineseSequence(["学生"]);
    voices = [voice("zh-CN")];
    events.dispatchEvent(new Event("voiceschanged"));
    await playing;
    expect(spoken[0].voice).toBe(voices[0]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("still attempts zh-CN playback if the voice list remains empty", async () => {
    voices = [];
    const playing = speakChineseSequence(["上学"]);
    await vi.advanceTimersByTimeAsync(1800);
    await playing;
    expect(spoken[0]).toMatchObject({ text: "上学", lang: "zh-CN", voice: null });
  });

  it("cancels pending voice loading when sound is stopped", async () => {
    voices = [];
    const playing = speakChineseSequence(["坐下"]);
    stopSpeech();
    await vi.advanceTimersByTimeAsync(1800);
    await playing;
    expect(synth.speak).not.toHaveBeenCalled();
  });

  it("keeps only the latest request while voices are loading", async () => {
    voices = [];
    const old = speakChineseSequence(["起立"]);
    const latest = speakChineseSequence(["洗手"]);
    voices = [voice("zh-CN")];
    events.dispatchEvent(new Event("voiceschanged"));
    await Promise.all([old, latest]);
    expect(spoken.map((utterance) => utterance.text)).toEqual(["洗手"]);
  });

  it("reports actual playback errors while ignoring intentional cancellation and stale events", async () => {
    const onStart = vi.fn();
    const onError = vi.fn();
    await speakChineseSequence(["喝水"], { onStart, onError });
    spoken[0].onstart?.();
    expect(onStart).toHaveBeenCalledOnce();
    spoken[0].onerror?.({ error: "canceled" });
    spoken[0].onerror?.({ error: "interrupted" });
    expect(onError).not.toHaveBeenCalled();
    spoken[0].onerror?.({ error: "language-unavailable" });
    expect(onError).toHaveBeenCalledExactlyOnceWith("language-unavailable");
    stopSpeech();
    spoken[0].onerror?.({ error: "synthesis-failed" });
    expect(onError).toHaveBeenCalledOnce();
  });

  it("preserves ordered multi-utterance prompts in the existing apps", async () => {
    await speakChineseSequence(["这是什么字？", " 水 ", ""], { rate: 0.95 });
    expect(spoken.map((utterance) => utterance.text)).toEqual(["这是什么字？", "水"]);
  });

  it("handles browsers without speech synthesis", async () => {
    vi.stubGlobal("window", {});
    expect(isSpeechSupported()).toBe(false);
    await speakChineseSequence(["你好"]);
    expect(synth.speak).not.toHaveBeenCalled();
  });
});
