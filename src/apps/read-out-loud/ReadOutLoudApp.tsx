import { useEffect, useMemo, useRef, useState } from "react";
import type { KaldiRecognizer, Model } from "vosk-browser";
import { UnitSelector } from "../../components/UnitSelector";
import { getReadWordsForUnits, type UnitId, type Word, WORDS } from "../../data/words";
import { burstConfetti } from "../../lib/confetti";
import { shuffleInPlace } from "../../lib/random";
import { playDing, playPop, playTada } from "../../lib/sfx";
import { speakChineseSequence, stopSpeech } from "../../lib/speech";

export type ReadOutLoudAppProps = {
  onHome?: () => void;
};

type AudioContextConstructor = new (contextOptions?: AudioContextOptions) => AudioContext;

type MicPipeline = {
  stream: MediaStream;
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  processor: ScriptProcessorNode;
  silentGain: GainNode;
};

type MicStatus = "idle" | "loading" | "requesting" | "listening" | "stopped" | "error";

type HeardState = "idle" | "partial" | "correct" | "near" | "wrong" | "unknown";

type HeardSpeech = {
  token: number;
  raw: string;
  hanzi: string;
  pinyin: string;
  state: HeardState;
};

type SpeechDescription = {
  raw: string;
  hanzi: string;
  pinyin: string;
  pinyinKey: string;
  segmentKeys: string[];
  known: boolean;
};

type CatalogEntry = {
  hanzi: string;
  pinyin: string;
  pinyinKey: string;
};

const AUDIO_STORAGE_KEY = "learncn.readOutLoud.audioEnabled";
const MODEL_PATH = `${import.meta.env.BASE_URL}models/vosk-model-small-cn-0.22.tar.gz`;
const PROMPT_ZH = "请读这个字。";
const STREAK_MILESTONE = 10;
const AUTO_ADD_UNIT_2_STREAK = 10;
const AUTO_ADD_UNIT_3_STREAK = 20;
const CELEBRATION_STEP_MS = 260;
const CELEBRATION_BUFFER_MS = 220;
const NEXT_DELAY_MS = 900;
const FLASH_DURATION_MS = 650;
const PROCESSOR_BUFFER_SIZE = 4096;
const HANZI_PATTERN = /\p{Script=Han}/gu;

const KNOWN_CATALOG = buildCatalog(WORDS);

function loadStoredBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return fallback;
    return stored === "true";
  } catch {
    return fallback;
  }
}

function storeBool(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

function normalizePinyinKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
}

function getPinyinVariants(key: string): string[] {
  const variants = new Set<string>();
  const normalized = normalizePinyinKey(key);
  if (!normalized) return [];

  variants.add(normalized);

  if (normalized.length % 2 === 0) {
    const midpoint = normalized.length / 2;
    const firstHalf = normalized.slice(0, midpoint);
    if (firstHalf && firstHalf === normalized.slice(midpoint)) {
      variants.add(firstHalf);
    }
  }

  return Array.from(variants);
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      );
    }

    previous = current;
  }

  return previous[b.length];
}

function hasPinyinVariantMatch(a: string, b: string): boolean {
  const aVariants = getPinyinVariants(a);
  const bVariants = new Set(getPinyinVariants(b));
  return aVariants.some((variant) => bVariants.has(variant));
}

function isNearPinyinMatch(a: string, b: string): boolean {
  const aVariants = getPinyinVariants(a);
  const bVariants = getPinyinVariants(b);

  for (const aVariant of aVariants) {
    for (const bVariant of bVariants) {
      const shorter = aVariant.length <= bVariant.length ? aVariant : bVariant;
      const longer = aVariant.length > bVariant.length ? aVariant : bVariant;

      if (shorter.length >= 2 && longer.includes(shorter)) return true;

      const distance = editDistance(aVariant, bVariant);
      if (distance <= 1) return true;
      if (longer.length >= 5 && distance <= 2) return true;
    }
  }

  return false;
}

function extractHanzi(value: string): string {
  return value.match(HANZI_PATTERN)?.join("") ?? "";
}

function buildCatalog(words: readonly Word[]): CatalogEntry[] {
  const byHanzi = new Map<string, CatalogEntry>();
  for (const word of words) {
    if (byHanzi.has(word.hanzi)) continue;
    byHanzi.set(word.hanzi, {
      hanzi: word.hanzi,
      pinyin: word.pinyin,
      pinyinKey: normalizePinyinKey(word.pinyin),
    });
  }

  return Array.from(byHanzi.values()).sort((a, b) => b.hanzi.length - a.hanzi.length);
}

function describeSpeech(raw: string): SpeechDescription {
  const hanzi = extractHanzi(raw);
  if (!hanzi) {
    return {
      raw,
      hanzi: "",
      pinyin: "",
      pinyinKey: "",
      segmentKeys: [],
      known: false,
    };
  }

  const segments: CatalogEntry[] = [];
  let known = true;
  let cursor = 0;

  while (cursor < hanzi.length) {
    const remaining = hanzi.slice(cursor);
    const match = KNOWN_CATALOG.find((entry) => remaining.startsWith(entry.hanzi));
    if (match) {
      segments.push(match);
      cursor += match.hanzi.length;
      continue;
    }

    known = false;
    const [nextChar] = Array.from(remaining);
    cursor += nextChar?.length ?? 1;
  }

  const pinyin = segments.map((segment) => segment.pinyin).join(" ");
  const segmentKeys = segments.map((segment) => segment.pinyinKey);

  return {
    raw,
    hanzi,
    pinyin,
    pinyinKey: known ? normalizePinyinKey(pinyin) : "",
    segmentKeys,
    known,
  };
}

function makeDeck(previousWordId: string | null, ids: string[]): string[] {
  const deck = [...ids];
  shuffleInPlace(deck);

  if (previousWordId && deck.length > 1 && deck[deck.length - 1] === previousWordId) {
    [deck[deck.length - 1], deck[deck.length - 2]] = [deck[deck.length - 2], deck[deck.length - 1]];
  }

  return deck;
}

function buildGrammar(words: readonly Word[]): string {
  const phrases = new Set<string>();

  for (const word of words) {
    phrases.add(word.hanzi);
    const chars = Array.from(word.hanzi);
    if (chars.length > 1) phrases.add(chars.join(" "));
  }

  phrases.add("[unk]");
  return JSON.stringify(Array.from(phrases));
}

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;
  const browserWindow = window as typeof window & {
    webkitAudioContext?: AudioContextConstructor;
  };
  return window.AudioContext ?? browserWindow.webkitAudioContext ?? null;
}

function createAudioContext(): AudioContext | null {
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return null;

  try {
    return new Ctor({ sampleRate: 16000 });
  } catch {
    return new Ctor();
  }
}

function formatError(error: unknown): string {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Microphone permission was blocked. Allow the mic, then try again.";
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Voice recognition could not start on this browser.";
}

async function createVoskModel(): Promise<Model> {
  const vosk = await import("vosk-browser");
  const modelUrl =
    typeof window === "undefined" ? MODEL_PATH : new URL(MODEL_PATH, window.location.href).toString();
  return await vosk.createModel(modelUrl, -1);
}

export default function ReadOutLoudApp({ onHome }: ReadOutLoudAppProps) {
  const [selectedUnits, setSelectedUnits] = useState<UnitId[]>([1]);
  const autoUnitsEnabledRef = useRef(true);
  const lastAutoAddedUnitRef = useRef<UnitId>(1);
  const unitToggleByUserRef = useRef(false);

  const activeWords = useMemo(() => getReadWordsForUnits(selectedUnits), [selectedUnits]);
  const activeWordIds = useMemo(() => activeWords.map((word) => word.id), [activeWords]);
  const activeWordIdsKey = useMemo(() => activeWordIds.join("|"), [activeWordIds]);

  const wordsById = useMemo<Record<string, Word>>(() => {
    return Object.fromEntries(activeWords.map((word) => [word.id, word])) as Record<string, Word>;
  }, [activeWords]);

  const activeWordsRef = useRef<Word[]>(activeWords);
  const activeWordIdsRef = useRef<string[]>(activeWordIds);
  const wordsByIdRef = useRef<Record<string, Word>>(wordsById);

  const [started, setStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => loadStoredBool(AUDIO_STORAGE_KEY, true));
  const [word, setWord] = useState<Word | null>(null);
  const [locked, setLocked] = useState(false);
  const [heard, setHeard] = useState<HeardSpeech>({
    token: 0,
    raw: "",
    hanzi: "",
    pinyin: "",
    state: "idle",
  });
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [micError, setMicError] = useState<string | null>(null);

  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [streakFlash, setStreakFlash] = useState<{ token: number; value: number } | null>(null);

  const audioEnabledRef = useRef(audioEnabled);
  const wordRef = useRef<Word | null>(word);
  const lockedRef = useRef(locked);
  const streakRef = useRef(streak);
  const deckRef = useRef<string[]>([]);
  const lastWordIdRef = useRef<string | null>(null);
  const nextTimeoutRef = useRef<number | null>(null);
  const celebrationTimeoutsRef = useRef<number[]>([]);
  const lastCelebratedStreakRef = useRef<number>(0);
  const hadMistakeThisWordRef = useRef<boolean>(false);
  const wrongKeysThisWordRef = useRef<Set<string>>(new Set());
  const heardTokenRef = useRef(0);
  const flashTokenRef = useRef(0);
  const ignoreRecognitionUntilRef = useRef(0);
  const modelRef = useRef<Model | null>(null);
  const recognizerRef = useRef<KaldiRecognizer | null>(null);
  const pipelineRef = useRef<MicPipeline | null>(null);
  const startTokenRef = useRef(0);
  const disposedRef = useRef(false);

  useEffect(() => {
    activeWordsRef.current = activeWords;
  }, [activeWords]);

  useEffect(() => {
    activeWordIdsRef.current = activeWordIds;
  }, [activeWordIdsKey]);

  useEffect(() => {
    wordsByIdRef.current = wordsById;
  }, [wordsById]);

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  useEffect(() => {
    wordRef.current = word;
  }, [word]);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  function clearNextTimeout(): void {
    if (nextTimeoutRef.current === null) return;
    window.clearTimeout(nextTimeoutRef.current);
    nextTimeoutRef.current = null;
  }

  function clearCelebrationTimeouts(): void {
    for (const timeoutId of celebrationTimeoutsRef.current) {
      window.clearTimeout(timeoutId);
    }
    celebrationTimeoutsRef.current = [];
  }

  function ignoreRecognitionFor(durationMs: number): void {
    ignoreRecognitionUntilRef.current = Math.max(ignoreRecognitionUntilRef.current, Date.now() + durationMs);
  }

  function setHeardSpeech(description: SpeechDescription, state: HeardState): void {
    heardTokenRef.current += 1;
    setHeard({
      token: heardTokenRef.current,
      raw: description.raw,
      hanzi: description.hanzi,
      pinyin: description.pinyin,
      state,
    });
  }

  function clearHeardSpeech(): void {
    heardTokenRef.current += 1;
    setHeard({
      token: heardTokenRef.current,
      raw: "",
      hanzi: "",
      pinyin: "",
      state: "idle",
    });
  }

  function flashStreak(value: number): void {
    flashTokenRef.current += 1;
    const token = flashTokenRef.current;
    setStreakFlash({ token, value });

    celebrationTimeoutsRef.current.push(
      window.setTimeout(() => {
        setStreakFlash((current) => (current?.token === token ? null : current));
      }, FLASH_DURATION_MS),
    );
  }

  function toggleUnit(unit: UnitId): void {
    autoUnitsEnabledRef.current = false;
    unitToggleByUserRef.current = true;
    setSelectedUnits((prev) => {
      const has = prev.includes(unit);
      const next = has ? prev.filter((u) => u !== unit) : [...prev, unit];
      if (next.length === 0) return prev;
      next.sort((a, b) => a - b);
      return next;
    });
  }

  function nextWord(): void {
    clearNextTimeout();
    stopSpeech();
    hadMistakeThisWordRef.current = false;
    wrongKeysThisWordRef.current = new Set();
    clearHeardSpeech();

    if (deckRef.current.length === 0) {
      deckRef.current = makeDeck(lastWordIdRef.current, activeWordIdsRef.current);
    }

    const nextWordId = deckRef.current.pop();
    if (!nextWordId) return;

    lastWordIdRef.current = nextWordId;
    const next = wordsByIdRef.current[nextWordId];
    if (!next) return;

    setWord(next);
    setLocked(false);
  }

  function resetGame(): void {
    clearNextTimeout();
    clearCelebrationTimeouts();
    stopSpeech();

    setCorrectCount(0);
    setMistakeCount(0);
    setSkipCount(0);
    setStreak(0);
    setBestStreak(0);
    setStreakFlash(null);
    setLocked(false);

    lastCelebratedStreakRef.current = 0;
    hadMistakeThisWordRef.current = false;
    wrongKeysThisWordRef.current = new Set();
    lastWordIdRef.current = null;
    deckRef.current = makeDeck(null, activeWordIdsRef.current);
    nextWord();
  }

  function startGame(): void {
    if (started) return;
    setStarted(true);
    resetGame();
  }

  function markCorrect(): void {
    if (lockedRef.current) return;
    const currentWord = wordRef.current;
    if (!currentWord) return;

    const nextStreak = hadMistakeThisWordRef.current ? 0 : streakRef.current + 1;
    const celebrationBursts =
      nextStreak > 0 && nextStreak % STREAK_MILESTONE === 0 ? nextStreak / STREAK_MILESTONE : 0;

    setLocked(true);
    lockedRef.current = true;
    setCorrectCount((count) => count + 1);

    if (hadMistakeThisWordRef.current) {
      setStreak(0);
    } else {
      setStreak((current) => {
        const next = current + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    }

    if (audioEnabledRef.current) {
      playDing();
      ignoreRecognitionFor(1500);
      void speakChineseSequence([currentWord.hanzi], { rate: 0.95 });
    }

    const celebrationExtraMs =
      celebrationBursts > 0
        ? (celebrationBursts - 1) * CELEBRATION_STEP_MS + CELEBRATION_BUFFER_MS
        : 0;

    nextTimeoutRef.current = window.setTimeout(() => {
      nextWord();
    }, NEXT_DELAY_MS + celebrationExtraMs);
  }

  function markWrong(description: SpeechDescription): void {
    const wrongKey = description.pinyinKey || description.segmentKeys.join("|") || description.hanzi || description.raw;
    if (wrongKeysThisWordRef.current.has(wrongKey)) return;
    wrongKeysThisWordRef.current.add(wrongKey);

    if (audioEnabledRef.current) playPop();
    hadMistakeThisWordRef.current = true;
    lastCelebratedStreakRef.current = 0;
    setMistakeCount((count) => count + 1);
    setStreak(0);
  }

  function skipWord(): void {
    if (!wordRef.current) return;
    if (lockedRef.current) return;

    clearNextTimeout();
    ignoreRecognitionFor(650);
    setLocked(true);
    lockedRef.current = true;
    setSkipCount((count) => count + 1);
    nextTimeoutRef.current = window.setTimeout(() => {
      nextWord();
    }, 120);
  }

  function scoreFinalSpeech(raw: string): void {
    if (Date.now() < ignoreRecognitionUntilRef.current) return;

    const description = describeSpeech(raw);
    if (!description.hanzi) {
      if (description.raw.trim()) setHeardSpeech(description, "unknown");
      return;
    }

    const currentWord = wordRef.current;
    if (!currentWord) {
      setHeardSpeech(description, "unknown");
      return;
    }

    const targetKey = normalizePinyinKey(currentWord.pinyin);
    const heardKeys = [description.pinyinKey, ...description.segmentKeys].filter(Boolean);
    const heardTarget =
      description.known &&
      heardKeys.some((heardKey) => hasPinyinVariantMatch(targetKey, heardKey));

    if (heardTarget) {
      setHeardSpeech(description, "correct");
      markCorrect();
      return;
    }

    if (description.known && heardKeys.some((heardKey) => isNearPinyinMatch(targetKey, heardKey))) {
      setHeardSpeech(description, "near");
      return;
    }

    if (description.known && description.segmentKeys.length > 0) {
      setHeardSpeech(description, "wrong");
      markWrong(description);
      return;
    }

    setHeardSpeech(description, "unknown");
  }

  function showPartialSpeech(raw: string): void {
    if (Date.now() < ignoreRecognitionUntilRef.current) return;
    if (lockedRef.current) return;

    const description = describeSpeech(raw);
    if (!description.hanzi && !description.raw.trim()) return;
    setHeardSpeech(description, "partial");
  }

  function createRecognizer(model: Model, sampleRate: number): KaldiRecognizer {
    const recognizer = new model.KaldiRecognizer(sampleRate, buildGrammar(activeWordsRef.current));
    recognizer.setWords(true);
    recognizer.on("partialresult", (message) => {
      if (message.event !== "partialresult") return;
      showPartialSpeech(message.result.partial);
    });
    recognizer.on("result", (message) => {
      if (message.event !== "result") return;
      scoreFinalSpeech(message.result.text);
    });
    recognizer.on("error", (message) => {
      if (message.event !== "error") return;
      setMicStatus("error");
      setMicError(message.error);
    });
    return recognizer;
  }

  function replaceRecognizer(): void {
    const model = modelRef.current;
    const pipeline = pipelineRef.current;
    if (!model || !model.ready || !pipeline) return;

    recognizerRef.current?.remove();
    recognizerRef.current = createRecognizer(model, pipeline.context.sampleRate);
  }

  function stopMicPipeline(): void {
    const pipeline = pipelineRef.current;
    if (!pipeline) return;

    pipeline.processor.onaudioprocess = null;
    pipeline.source.disconnect();
    pipeline.processor.disconnect();
    pipeline.silentGain.disconnect();
    for (const track of pipeline.stream.getTracks()) {
      track.stop();
    }
    void pipeline.context.close().catch(() => {
      // ignore
    });
    pipelineRef.current = null;
  }

  function stopListening(): void {
    startTokenRef.current += 1;
    recognizerRef.current?.remove();
    recognizerRef.current = null;
    stopMicPipeline();
    setMicStatus("stopped");
  }

  async function startListening(): Promise<void> {
    const startToken = startTokenRef.current + 1;
    startTokenRef.current = startToken;
    setMicError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus("error");
      setMicError("This browser does not expose microphone access to web apps.");
      return;
    }

    try {
      recognizerRef.current?.remove();
      recognizerRef.current = null;
      stopMicPipeline();

      setMicStatus("loading");
      let model = modelRef.current;
      if (!model) {
        model = await createVoskModel();
      }
      if (disposedRef.current || startTokenRef.current !== startToken) {
        if (modelRef.current !== model) model.terminate();
        return;
      }
      modelRef.current = model;

      setMicStatus("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      if (disposedRef.current || startTokenRef.current !== startToken) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      const context = createAudioContext();
      if (!context) {
        for (const track of stream.getTracks()) track.stop();
        throw new Error("This browser does not support the Web Audio API.");
      }

      if (context.state === "suspended") {
        await context.resume();
      }

      const recognizer = createRecognizer(model, context.sampleRate);
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(PROCESSOR_BUFFER_SIZE, 1, 1);
      const silentGain = context.createGain();
      silentGain.gain.value = 0;

      processor.onaudioprocess = (event) => {
        const currentRecognizer = recognizerRef.current;
        if (!currentRecognizer) return;
        try {
          currentRecognizer.acceptWaveform(event.inputBuffer);
        } catch (error) {
          setMicStatus("error");
          setMicError(formatError(error));
        }
      };

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(context.destination);

      recognizerRef.current = recognizer;
      pipelineRef.current = { stream, context, source, processor, silentGain };
      setMicStatus("listening");
    } catch (error) {
      recognizerRef.current?.remove();
      recognizerRef.current = null;
      stopMicPipeline();
      setMicStatus("error");
      setMicError(formatError(error));
    }
  }

  function replayPrompt(): void {
    if (!word) return;
    if (!audioEnabled) return;
    ignoreRecognitionFor(1600);
    void speakChineseSequence([word.hanzi], { rate: 0.95 });
  }

  useEffect(() => {
    startGame();
  }, []);

  useEffect(() => {
    storeBool(AUDIO_STORAGE_KEY, audioEnabled);
  }, [audioEnabled]);

  useEffect(() => {
    if (!started) return;
    if (!word) return;
    if (!audioEnabled) return;
    ignoreRecognitionFor(1100);
    void speakChineseSequence([PROMPT_ZH], { rate: 0.95 });
  }, [started, word?.id, audioEnabled]);

  useEffect(() => {
    if (!autoUnitsEnabledRef.current) return;
    const desiredMaxUnit: UnitId =
      streak >= AUTO_ADD_UNIT_3_STREAK ? 3 : streak >= AUTO_ADD_UNIT_2_STREAK ? 2 : 1;
    const prev = lastAutoAddedUnitRef.current;
    if (desiredMaxUnit <= prev) return;
    lastAutoAddedUnitRef.current = desiredMaxUnit;
    setSelectedUnits((units) => {
      const next = new Set<UnitId>(units);
      for (let u = prev + 1; u <= desiredMaxUnit; u++) {
        next.add(u as UnitId);
      }
      return Array.from(next).sort((a, b) => a - b);
    });
  }, [streak]);

  useEffect(() => {
    if (!started) return;
    deckRef.current = makeDeck(lastWordIdRef.current, activeWordIds);
    replaceRecognizer();

    const wasUserToggle = unitToggleByUserRef.current;
    unitToggleByUserRef.current = false;
    if (!wasUserToggle && (locked || nextTimeoutRef.current !== null)) return;
    nextWord();
  }, [activeWordIdsKey]);

  useEffect(() => {
    if (streak <= 0) return;
    if (streak % STREAK_MILESTONE !== 0) return;
    if (lastCelebratedStreakRef.current === streak) return;
    lastCelebratedStreakRef.current = streak;

    const bursts = Math.max(1, Math.floor(streak / STREAK_MILESTONE));
    clearCelebrationTimeouts();

    for (let index = 0; index < bursts; index++) {
      celebrationTimeoutsRef.current.push(
        window.setTimeout(() => {
          flashStreak(streak);
          burstConfetti();
          if (audioEnabledRef.current) playTada();
        }, index * CELEBRATION_STEP_MS),
      );
    }
  }, [streak]);

  useEffect(() => {
    return () => {
      disposedRef.current = true;
      startTokenRef.current += 1;
      clearNextTimeout();
      clearCelebrationTimeouts();
      stopSpeech();
      recognizerRef.current?.remove();
      recognizerRef.current = null;
      stopMicPipeline();
      modelRef.current?.terminate();
      modelRef.current = null;
    };
  }, []);

  const micLabel =
    micStatus === "loading"
      ? "Loading local Mandarin model"
      : micStatus === "requesting"
        ? "Waiting for microphone permission"
        : micStatus === "listening"
          ? "Listening locally"
          : micStatus === "stopped"
            ? "Mic stopped"
            : micStatus === "error"
              ? "Mic unavailable"
              : "Mic not started";

  const heardPanelClass =
    heard.state === "correct"
      ? "bg-emerald-500/15 text-emerald-100 ring-emerald-300/50"
      : heard.state === "near"
        ? "bg-amber-500/15 text-amber-100 ring-amber-300/40"
      : heard.state === "wrong"
        ? "bg-rose-500/15 text-rose-100 ring-rose-300/50"
        : heard.state === "unknown"
          ? "bg-amber-500/15 text-amber-100 ring-amber-300/40"
          : "bg-slate-950/40 text-slate-100 ring-slate-700/40";

  const heardCaption =
    heard.state === "near"
      ? "Close. Try again; no penalty."
      : heard.hanzi
        ? heard.hanzi
        : heard.raw.trim()
          ? heard.raw.trim()
          : "The pinyin will light up here when Vosk hears a practice word.";

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl items-center justify-center p-4 sm:p-6 [padding-top:calc(theme(spacing.4)+env(safe-area-inset-top))] [padding-bottom:calc(theme(spacing.4)+env(safe-area-inset-bottom))]">
        <div className="w-full rounded-3xl bg-slate-900/50 p-6 shadow-2xl ring-1 ring-slate-700/40 backdrop-blur sm:p-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Read Out Loud</h1>
              <p className="text-sm text-slate-300">
                Say the character out loud. Vosk listens locally after the model downloads.
              </p>
              <div className="mt-3">
                <div className="text-xs font-medium text-slate-400">Units</div>
                <div className="mt-2">
                  <UnitSelector selectedUnits={selectedUnits} onToggle={toggleUnit} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onHome ? (
                <button
                  type="button"
                  onClick={() => {
                    stopListening();
                    stopSpeech();
                    onHome();
                  }}
                  className="inline-flex touch-manipulation items-center justify-center rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-slate-700/40 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300/40"
                >
                  Apps
                </button>
              ) : null}
            </div>
          </header>

          {word ? (
            <div className="mt-8">
              <div className="flex flex-col items-center text-center">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Say this</div>
                <div className="mt-3 select-none text-7xl font-semibold leading-none tracking-tight sm:text-8xl">
                  {word.hanzi}
                </div>
                <div className="mt-3 text-sm text-slate-400">Meaning: {word.english}</div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => void startListening()}
                    disabled={micStatus === "loading" || micStatus === "requesting"}
                    className="inline-flex touch-manipulation items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-200/40 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {micStatus === "listening" ? "Restart mic" : "Start listening"}
                  </button>

                  <button
                    type="button"
                    onClick={stopListening}
                    disabled={micStatus !== "listening"}
                    className="inline-flex touch-manipulation items-center gap-2 rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 ring-1 ring-slate-700/40 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Stop mic
                  </button>

                  <button
                    type="button"
                    onClick={replayPrompt}
                    disabled={!audioEnabled}
                    className="inline-flex touch-manipulation items-center gap-2 rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 ring-1 ring-slate-700/40 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Hear answer
                  </button>

                  <button
                    type="button"
                    onClick={skipWord}
                    disabled={locked}
                    className="inline-flex touch-manipulation items-center gap-2 rounded-full bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-100 ring-1 ring-slate-700/40 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Skip
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <span
                    className={[
                      "h-2.5 w-2.5 rounded-full",
                      micStatus === "listening"
                        ? "animate-pulse bg-emerald-400"
                        : micStatus === "error"
                          ? "bg-rose-400"
                          : "bg-slate-500",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                  {micLabel}
                </div>

                {micStatus === "loading" ? (
                  <div className="mt-1 text-xs text-slate-500">
                    First load downloads about 42 MB, then the browser cache should reuse it.
                  </div>
                ) : null}

                {micError ? <div className="mt-2 text-xs text-rose-300">{micError}</div> : null}
              </div>

              <div className={["mt-8 rounded-3xl p-5 text-center ring-1 transition-colors", heardPanelClass].join(" ")}>
                <div className="text-xs font-semibold uppercase tracking-wide opacity-70">Heard</div>
                <div key={heard.token} className="mt-2 min-h-10 text-3xl font-semibold tracking-tight">
                  {heard.pinyin ||
                    (heard.hanzi ? "Not in list" : micStatus === "listening" ? "Listening..." : "Start the mic")}
                </div>
                <div className="mt-1 min-h-6 text-sm opacity-80">
                  {heardCaption}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-5">
                <div className="rounded-2xl bg-slate-950/40 px-4 py-3 ring-1 ring-slate-700/30">
                  <div className="text-xs text-slate-400">Correct</div>
                  <div className="mt-1 text-lg font-semibold text-slate-100">{correctCount}</div>
                </div>
                <div className="rounded-2xl bg-slate-950/40 px-4 py-3 ring-1 ring-slate-700/30">
                  <div className="text-xs text-slate-400">Mistakes</div>
                  <div className="mt-1 text-lg font-semibold text-slate-100">{mistakeCount}</div>
                </div>
                <div className="rounded-2xl bg-slate-950/40 px-4 py-3 ring-1 ring-slate-700/30">
                  <div className="text-xs text-slate-400">Skipped</div>
                  <div className="mt-1 text-lg font-semibold text-slate-100">{skipCount}</div>
                </div>
                <div className="rounded-2xl bg-slate-950/40 px-4 py-3 ring-1 ring-slate-700/30">
                  <div className="text-xs text-slate-400">Streak</div>
                  <div className="mt-1 text-lg font-semibold text-slate-100">{streak}</div>
                </div>
                <div className="rounded-2xl bg-slate-950/40 px-4 py-3 ring-1 ring-slate-700/30">
                  <div className="text-xs text-slate-400">Best</div>
                  <div className="mt-1 text-lg font-semibold text-slate-100">{bestStreak}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 text-center">
              <div className="text-2xl font-semibold text-slate-200">Loading...</div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed z-50 flex flex-col gap-2 [right:calc(theme(spacing.4)+env(safe-area-inset-right))] [bottom:calc(theme(spacing.4)+env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setAudioEnabled((value) => !value)}
          className="inline-flex touch-manipulation items-center gap-2 rounded-full bg-slate-800/90 px-4 py-2 text-sm font-medium text-slate-100 shadow-lg ring-1 ring-slate-700/40 backdrop-blur hover:bg-slate-700"
          aria-pressed={audioEnabled}
          title="Toggle audio"
        >
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              audioEnabled ? "bg-emerald-400" : "bg-slate-500",
            ].join(" ")}
            aria-hidden="true"
          />
          Audio {audioEnabled ? "On" : "Off"}
        </button>
      </div>

      {streakFlash ? (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
          <div
            key={streakFlash.token}
            className="animate-[streak-flash_650ms_cubic-bezier(0.2,0.9,0.2,1)] rounded-3xl bg-slate-950/35 px-8 py-5 text-center shadow-2xl ring-1 ring-slate-200/10 backdrop-blur"
          >
            <div className="text-7xl font-extrabold tracking-tight text-amber-200">
              {streakFlash.value}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
