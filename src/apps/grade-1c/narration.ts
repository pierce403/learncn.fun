import type { SpeechSegment } from "../../lib/speech";
import { practiceSpeech, type Lesson, type Word } from "./curriculum";
import type { Question } from "./game";

const LESSON_DIRECTIONS: Record<string, string> = {
  school: "Let's learn words for school! Listen, then say the word with me. Tap Next when you're ready.",
  greetings: "Let's learn how to say hello! Listen, then try saying it too. Tap Next when you're ready.",
  actions: "Let's learn action words! Listen and try the action. Tap Next when you're ready.",
  friends: "Let's make a friend! Listen to each sentence, then try saying it. Tap Next when you're ready.",
  numbers: "Let's count! Tap the dots, one at a time. Then listen to the Chinese number. Tap Next when you're ready.",
  "w2-finals": "Let's explore sounds! Listen, then copy the sound with your mouth. Tap Next sound when you're ready.",
  "w2-initials": "Let's learn starting letters! Look at the letter and listen. Tap Next sound when you're ready.",
  "w2-reading": "Let's learn new Chinese words! Look at the picture. Listen, then say the word. Tap Next when you're ready.",
  "w2-writing": "Let's get ready to write! First, look at each word and listen. Tap Next when you're ready.",
  "w2-compare": "Let's compare! Count the fish on each side. Is the left side more, less, or the same? Tap Next when you're ready.",
  "w2-order": "Let's put numbers in order! Count along with each row. Tap Next when you're ready.",
};

// Written pinyin is for the screen. The English narrator gives mouth cues;
// actual pronunciation always comes from the Mandarin example syllable.
const SOUND_DIRECTIONS: Record<string, string> = {
  a: "Open your mouth wide. Keep your tongue low. Listen and copy.",
  o: "Make a circle with your lips. Keep it still. Listen and copy.",
  e: "Open your mouth a little. Keep your tongue back and your lips relaxed. Listen and copy.",
  i: "Smile, like when you say the word see. Listen and copy.",
  u: "Round your lips, like the middle sound in moon. Listen and copy.",
  ü: "Say the word see. Hold that last sound. Keep your tongue still and round your lips. Listen for that sound at the end.",
  er: "Lift your tongue tip a little without touching the roof of your mouth. Listen and copy.",
  y: "This is the letter why. Look for it at the start of the word. Listen.",
  w: "This is the letter double you. Look for it at the start of the word. Listen.",
};

export function lessonDirections(lesson: Lesson): string {
  return LESSON_DIRECTIONS[lesson.id] ?? "Let's learn together! Listen, then try saying it. Tap Next when you're ready.";
}

export function spokenText(text: string): SpeechSegment[] {
  // Do not ask an English voice to pronounce Hanzi or our example child's name.
  return text.replaceAll("Xiaoming", "小明").split(/([\p{Script=Han}]+)/u).filter((part) => /[\p{L}\p{N}]/u.test(part)).map((part) => ({
    text: part.trim(), language: /\p{Script=Han}/u.test(part) ? "zh" : "en",
  }));
}

export function cardNarration(word: Word, includeTip = true): SpeechSegment[] {
  const study = word.example ?? word;
  const explanation = word.soundCue
    ? [{ text: SOUND_DIRECTIONS[word.hanzi] ?? "Listen and copy the sound.", language: "en" as const }]
    : spokenText(`${study.english}.${includeTip ? ` ${word.tip}` : ""}`);
  return [...explanation, { text: practiceSpeech(word), language: "zh" }];
}

export function lessonNarration(lesson: Lesson, word = lesson.words[0]): SpeechSegment[] {
  return [{ text: lessonDirections(lesson), language: "en" }, ...cardNarration(word, false)];
}

export function questionNarration(lesson: Lesson, question: Question, traceFallback = false, fullDirections = true): SpeechSegment[] {
  // After the first question, speak only the content needed to answer.
  // Full directions remain available through the explicit replay button.
  if (!fullDirections) {
    switch (question.mode) {
      case "meaning":
      case "listen":
      case "sound": return [{ text: practiceSpeech(question.word), language: "zh" }];
      case "trace": return traceFallback ? spokenText(`Find ${question.word.english}.`) : [{ text: practiceSpeech(question.word), language: "zh" }];
      case "recognize": return spokenText(`Find ${question.word.english}.`);
      case "count": return spokenText("How many dots?");
      case "compare": return spokenText("More, less, or the same?");
      case "order": return spokenText("What's missing?");
      case "sound-read": return spokenText("Find the sound.");
    }
  }
  let instruction: string;
  let example = false;
  switch (question.mode) {
    case "meaning":
    case "listen":
      instruction = `Listen to the Chinese ${lesson.kind === "sentences" ? "sentence" : "word"}. Tap what it means. Tap a small speaker to hear a choice.`;
      example = true;
      break;
    case "recognize": instruction = `Find the Chinese word for ${question.word.english}. Tap your answer.`; break;
    case "count": instruction = "Count the dots. Tap the matching Chinese number."; break;
    case "sound": instruction = "Listen. Tap the letters that make that sound."; example = true; break;
    case "sound-read": instruction = "Look at the word above the answers. Tap the matching sound."; break;
    case "trace":
      instruction = traceFallback ? `Tap the Chinese word for ${question.word.english}.` : "Use your finger to follow the glowing line. Then trace the next line.";
      example = !traceFallback;
      break;
    case "compare": instruction = "Count both groups. Does the left side have more, less, or the same? Tap a sign. Tap a small speaker to hear a choice."; break;
    case "order": instruction = "Count along the row. Tap the number that fills the empty spot."; break;
  }
  return [...spokenText(instruction), ...(example ? [{ text: practiceSpeech(question.word), language: "zh" as const }] : [])];
}
