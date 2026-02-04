export type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

function normalizeLang(lang: string): string {
  return lang.trim().toLowerCase();
}

function pickChineseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const candidates = voices.filter((voice) => {
    const lang = normalizeLang(voice.lang);
    return lang === "zh" || lang.startsWith("zh-") || lang === "cmn" || lang.startsWith("cmn-");
  });

  let best: SpeechSynthesisVoice | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const voice of candidates) {
    const lang = normalizeLang(voice.lang);
    const name = voice.name.trim().toLowerCase();

    let score = 0;

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
  const enVoices = voices.filter((voice) => normalizeLang(voice.lang).startsWith("en"));
  return (
    enVoices.find((voice) => normalizeLang(voice.lang) === "en-us") ??
    enVoices.find((voice) => normalizeLang(voice.lang).startsWith("en-")) ??
    enVoices[0]
  );
}

async function getVoices(timeoutMs = 1800): Promise<SpeechSynthesisVoice[]> {
  const synth = window.speechSynthesis;
  const immediate = synth.getVoices();
  if (immediate.length > 0) return immediate;

  return await new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let interval: number | null = null;

    const cleanup = () => {
      synth.removeEventListener("voiceschanged", onVoicesChanged);
      if (interval !== null) window.clearInterval(interval);
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
    window.setTimeout(() => {
      cleanup();
      resolve(synth.getVoices());
    }, timeoutMs);
  });
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

async function speakSequence(
  texts: string[],
  voicePicker: (voices: SpeechSynthesisVoice[]) => SpeechSynthesisVoice | undefined,
  fallbackLang: string,
  options: SpeakOptions = {},
): Promise<void> {
  if (!isSpeechSupported()) return;

  const { rate = 0.95, pitch = 1, volume = 1 } = options;
  const synth = window.speechSynthesis;

  synth.cancel();

  const voices = await getVoices();
  const voice = voicePicker(voices);

  for (const text of texts) {
    const trimmed = text.trim();
    if (!trimmed) continue;

    const utterance = new SpeechSynthesisUtterance(trimmed);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? fallbackLang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    synth.speak(utterance);
  }
}

export async function speakChineseSequence(
  texts: string[],
  options: SpeakOptions = {},
): Promise<void> {
  await speakSequence(texts, pickChineseVoice, "zh-CN", options);
}

export async function speakEnglishSequence(
  texts: string[],
  options: SpeakOptions = {},
): Promise<void> {
  await speakSequence(texts, pickEnglishVoice, "en-US", options);
}
