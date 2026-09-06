import { useCallback, useEffect, useRef, useState } from "react";

function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function isMandarin(voice: SpeechSynthesisVoice) {
  const language = voice.lang.toLowerCase().replaceAll("_", "-");
  return (language === "cmn" || language.startsWith("cmn-") ||
    ["zh", "zh-cn", "zh-tw", "zh-sg", "zh-hans", "zh-hant", "zh-hans-cn", "zh-hans-sg", "zh-hant-tw"].includes(language)) &&
    !/cantonese|粤语/i.test(voice.name);
}

export function useLessonAudio() {
  const [enabled, setEnabled] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [message, setMessage] = useState("");
  const generation = useRef(0);
  // Retain the utterance for browsers that otherwise collect it before playback ends.
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!supported()) return;
    const update = () => setVoices(window.speechSynthesis.getVoices());
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      generation.current++;
      window.speechSynthesis.removeEventListener("voiceschanged", update);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stop = useCallback(() => {
    generation.current++;
    if (supported()) window.speechSynthesis.cancel();
    utterance.current = null;
  }, []);

  const play = useCallback((text: string, language: "zh" | "en" = "zh", slow = false) => {
    stop();
    if (!enabled) return;
    if (!supported()) {
      setMessage("Audio is unavailable in this browser. You can still play using the words and hints.");
      return;
    }
    const available = window.speechSynthesis.getVoices();
    const matches = available.filter((voice) => language === "en"
      ? /^en(?:[-_]|$)/i.test(voice.lang)
      : isMandarin(voice));
    if (available.length && !matches.length) {
      setMessage(`${language === "zh" ? "Mandarin" : "English"} audio isn't available on this device. Use the written words and hints to keep playing.`);
      return;
    }
    const voice = matches.find((candidate) => language === "zh"
      ? /^(zh[-_]CN|cmn[-_]Hans[-_]CN)$/i.test(candidate.lang)
      : /^en[-_]US$/i.test(candidate.lang)) ?? matches[0];
    const current = generation.current;
    const next = new SpeechSynthesisUtterance(text);
    next.lang = voice?.lang ?? (language === "zh" ? "zh-CN" : "en-US");
    if (voice) next.voice = voice;
    next.rate = slow ? 0.65 : 0.85;
    next.onstart = () => { if (generation.current === current) setMessage(""); };
    next.onerror = (event) => {
      if (generation.current !== current || event.error === "interrupted" || event.error === "canceled") return;
      setMessage("Couldn't play that audio. Try Listen again, or use the word hint to keep playing.");
    };
    utterance.current = next;
    window.speechSynthesis.speak(next);
  }, [enabled, stop]);

  const hasMandarin = !voices.length || voices.some(isMandarin);
  const canListen = enabled && supported() && hasMandarin;

  function toggle() {
    stop();
    setEnabled((value) => !value);
    setMessage("");
  }

  return { enabled, canListen, message, play, stop, toggle };
}
