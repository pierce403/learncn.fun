import { useCallback, useEffect, useRef, useState } from "react";
import { isSpeechSupported, speakBilingualSequence, stopSpeech, type SpeechSegment } from "../../lib/speech";

export function useLessonAudio() {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const generation = useRef(0);

  const stop = useCallback(() => {
    generation.current++;
    stopSpeech();
  }, []);

  useEffect(() => stop, [stop]);

  const narrate = useCallback((segments: SpeechSegment[]) => {
    stop();
    if (!enabled) return;
    if (!isSpeechSupported()) {
      setMessage("Audio is unavailable in this browser. You can still play using the words and hints.");
      return;
    }
    setMessage("");
    const current = generation.current;
    const playbackFailed = () => {
      if (generation.current !== current) return;
      setMessage("Couldn't play that audio. Try Listen again, or use the word hint to keep playing.");
    };
    // Match the other apps: prefer a listed voice, but let the browser resolve
    // zh-CN/en-US when its voice list is incomplete. Only playback can fail.
    void speakBilingualSequence(segments.map((segment) => ({ ...segment, rate: segment.rate ?? (segment.language === "en" ? 0.95 : 0.85) })), {
      onStart: () => { if (generation.current === current) setMessage(""); },
      onError: playbackFailed,
    }).catch(playbackFailed);
  }, [enabled, stop]);

  const play = useCallback((text: string, language: "zh" | "en" = "zh", slow = false) => {
    narrate([{ text, language, rate: slow ? 0.65 : language === "en" ? 0.95 : 0.85 }]);
  }, [narrate]);

  // A voice inventory is not a capability check: browser/OS fallback can work
  // even when getVoices() lists only English or has not populated yet.
  const canListen = enabled && isSpeechSupported();

  function toggle() {
    stop();
    setEnabled((value) => !value);
    setMessage("");
  }

  return { enabled, canListen, message, play, narrate, stop, toggle };
}
