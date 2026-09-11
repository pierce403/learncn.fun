export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onError?: (error: SpeechSynthesisErrorCode) => void;
};

export type SpeechSegment = { text: string; language: "en" | "zh"; rate?: number };

export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

let speechGeneration = 0;
const pendingUtterances = new Set<SpeechSynthesisUtterance>();

function normalizeLang(lang: string): string {
  return lang.trim().toLowerCase().replaceAll("_", "-");
}

function voiceQuality(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  if (/novelty|whisper|trinoids|zarvox|boing|bubbles|bad news|good news/.test(name)) return -100;
  if (/natural|neural/.test(name)) return 80;
  if (/premium/.test(name)) return 60;
  if (/enhanced/.test(name)) return 40;
  if (/google/.test(name)) return 30;
  return voice.default ? 2 : 0;
}

function pickChineseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const candidates = voices.filter((voice) => {
    const lang = normalizeLang(voice.lang);
    if (lang.startsWith("yue") || /cantonese|粤|廣東話|广东话/i.test(voice.name)) return false;
    return lang === "zh" || lang.startsWith("zh-") || lang === "cmn" || lang.startsWith("cmn-");
  });

  let best: SpeechSynthesisVoice | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const voice of candidates) {
    const lang = normalizeLang(voice.lang);
    const name = voice.name.trim().toLowerCase();

    let score = voiceQuality(voice) / 10;

    if (lang === "cmn-hans-cn") score += 110;
    else if (lang === "zh-cn") score += 105;
    else if (lang === "zh-hans-cn") score += 103;
    else if (lang === "cmn-hans") score += 95;
    else if (lang === "zh-hans") score += 92;
    else if (lang === "cmn") score += 90;
    else if (lang === "zh") score += 80;
    else if (lang.startsWith("cmn-")) score += 70;
    else if (lang.startsWith("zh-")) score += 60;

    if (voice.default) score += 2;
    if (voice.localService) score += 1;

    if (
      name.includes("mandarin") ||
      name.includes("putonghua") ||
      name.includes("普通话") ||
      name.includes("国语")
    ) {
      score += 8;
    }

    if (name.includes("beijing") || name.includes("北京")) score += 4;
    if (name.includes("china") || name.includes("中国") || name.includes("大陆")) score += 3;

    if (lang === "zh-tw" || name.includes("taiwan") || name.includes("台湾")) score -= 12;
    if (lang === "zh-hk" || name.includes("hong kong") || name.includes("hongkong") || name.includes("香港"))
      score -= 12;

    if (name.includes("cantonese") || name.includes("粤") || lang.startsWith("yue")) score -= 18;

    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }

  return best;
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Locale comes first; list order and the device's British default must not
  // override an American voice. Natural/enhanced voices win within en-US.
  const american = voices.filter((voice) => normalizeLang(voice.lang) === "en-us");
  // With no advertised US voice, leave voice unset and request en-US so the
  // browser can resolve an unlisted voice, as it does for Mandarin.
  return american.sort((a, b) => voiceQuality(b) - voiceQuality(a))[0];
}

async function getVoices(timeoutMs = 1800): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const immediate = synth.getVoices();
  if (immediate.length > 0) return immediate;

  return await new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let interval: number | null = null;
    let timeout: number | null = null;

    const cleanup = () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      if (interval !== null) window.clearInterval(interval);
      if (timeout !== null) window.clearTimeout(timeout);
    };

    const tryResolve = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        cleanup();
        resolve(voices);
        return true;
      }
      return false;
    };

    const onVoicesChanged = () => {
      tryResolve();
    };

    synth.addEventListener("voiceschanged", onVoicesChanged);
    interval = window.setInterval(() => {
      tryResolve();
    }, 50);
    timeout = window.setTimeout(() => {
      cleanup();
      resolve(synth.getVoices());
    }, timeoutMs);
  });
}

export function stopSpeech(): void {
  speechGeneration++;
  pendingUtterances.clear();
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export async function speakBilingualSequence(
  segments: SpeechSegment[],
  options: SpeakOptions = {},
): Promise<void> {
  if (!isSpeechSupported()) return;

  const { rate = 0.95, pitch = 1, volume = 1 } = options;
  const synth = window.speechSynthesis;

  stopSpeech();
  const generation = speechGeneration;

  const voices = await getVoices();
  if (generation !== speechGeneration) return;
  for (const segment of segments) {
    const trimmed = segment.text.trim();
    if (!trimmed) continue;
    const voice = segment.language === "zh" ? pickChineseVoice(voices) : pickEnglishVoice(voices);

    const utterance = new SpeechSynthesisUtterance(trimmed);
    if (voice) utterance.voice = voice;
    utterance.lang = voice ? normalizeLang(voice.lang) : segment.language === "zh" ? "zh-CN" : "en-US";
    utterance.rate = segment.rate ?? rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onstart = () => {
      if (generation === speechGeneration) options.onStart?.();
    };
    utterance.onend = () => { pendingUtterances.delete(utterance); };
    utterance.onerror = (event) => {
      pendingUtterances.delete(utterance);
      if (generation !== speechGeneration || event.error === "interrupted" || event.error === "canceled") return;
      options.onError?.(event.error);
    };

    // Keep playback alive on browsers that collect unreferenced utterances early.
    pendingUtterances.add(utterance);
    synth.speak(utterance);
  }
}

export async function speakChineseSequence(
  texts: string[],
  options: SpeakOptions = {},
): Promise<void> {
  await speakBilingualSequence(texts.map((text) => ({ text, language: "zh" })), options);
}

export async function speakEnglishSequence(
  texts: string[],
  options: SpeakOptions = {},
): Promise<void> {
  await speakBilingualSequence(texts.map((text) => ({ text, language: "en" })), options);
}
