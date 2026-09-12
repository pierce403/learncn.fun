import type { SpeechSegment } from "../../lib/speech";
import { practiceSpeech, type Lesson, type Word } from "./curriculum";
import type { Question } from "./game";

export const MANDARIN_LESSON_DIRECTIONS: Record<string, string> = {
  school: "一起来学学校里的词语！听一听，跟着读。准备好了，就点下一张。",
  greetings: "一起来学打招呼！听一听，跟着说。准备好了，就点下一张。",
  actions: "一起来学动作！听一听，做一做。准备好了，就点下一张。",
  friends: "一起来交朋友！听一句，跟着说一句。准备好了，就点下一张。",
  numbers: "一起来数数！一个一个地点圆点，再听听中文数字。准备好了，就点下一张。",
  "w2-finals": "一起来学发音！听一听，跟着读。准备好了，就点下一个。",
  "w2-initials": "一起来学声母！看看字母，听听发音。准备好了，就点下一个。",
  "w2-reading": "一起来认汉字！看看图片，听一听，跟着读。准备好了，就点下一张。",
  "w2-writing": "一起来写汉字！先看看每个字，听听怎么读。准备好了，就点下一张。",
  "w2-compare": "一起来比一比！数数两边的鱼。左边更多、更少，还是一样多？准备好了，就点下一张。",
  "w2-order": "一起来排数字！跟着每一行数一数。准备好了，就点下一张。",
};

const SOUND_TIPS: Record<string, string> = {
  a: "嘴巴张大，舌头放低。听一听，跟着读。",
  o: "嘴唇拢成圆圈，保持不动。听一听，跟着读。",
  e: "嘴巴微微张开，舌头往后，嘴唇放松。听一听，跟着读。",
  i: "嘴角向两边拉，像微笑一样。听一听，跟着读。",
  u: "嘴唇拢成小圆圈。听一听，跟着读。",
  ü: "先发衣的音，舌头不动，把嘴唇拢圆。听听词尾的声音。",
  er: "舌尖轻轻翘起来，不碰上面。听一听，跟着读。",
  y: "看看这个声母，找找它在音节开头的位置。听一听。",
  w: "看看这个声母，找找它在音节开头的位置。听一听。",
};

const WORD_TIPS: Record<string, string> = {
  school: "想一想，背上书包去学校。",
  teacher: "指一指帮助你学习的人。",
  student: "你是学生！学生和上学里都有学这个字。",
  morning: "早上见到老师时，可以这样说。",
  afternoon: "下午见面时，可以这样打招呼。",
  night: "睡觉前可以这样说。这三个问候语最后都有安这个字。",
  stand: "如果旁边有空间，就站起来，跟着说。",
  sit: "轻轻坐下，跟着说。",
  raise: "像在教室里一样，举起一只手。",
  lower: "把手放下来，也可以把东西放下来。",
  wash: "做一做洗手的动作。",
  drink: "做一做喝水的动作。",
  "my-name": "试着说说你自己的名字！",
  "your-name": "问问朋友叫什么名字！",
  "my-age": "试着说说你自己几岁了！",
  "w2-clothes": "指一指你的衣服。",
  "w2-fish": "摆摆手，像小鱼一样游一游。",
  "w2-rain": "动动手指，像小雨点落下来。",
  "w2-ear": "指一指耳朵，听一听。",
  "w2-tooth": "笑一笑，露出牙齿。",
  "w2-one": "只有一笔，从左往右写。",
  "w2-two": "先写上面一横，再写下面一横。",
  "w2-five": "跟着亮起来的笔画写。",
  "w2-mouth": "三笔写出这个小方框。",
  "w2-person": "两笔，像两条腿。",
  "w2-more": "左边的鱼比右边多。",
  "w2-less": "左边的鱼比右边少。",
  "w2-same": "三和三一样多。",
  "w2-up": "每次增加一。",
  "w2-down": "每次减少一。",
};

export function mandarinCardNarration(word: Word, includeTip: boolean): SpeechSegment[] {
  const tip = word.soundCue ? SOUND_TIPS[word.hanzi] : word.value !== undefined
    ? word.value === 0 ? "零就是一个也没有。这里没有圆点。" : "一个一个地点圆点，数一数，再读出这个数字。"
    : WORD_TIPS[word.id];
  return [
    ...(includeTip || word.soundCue ? [{ text: tip ?? "听一听，跟着读。", language: "zh" as const }] : []),
    { text: practiceSpeech(word), language: "zh" },
  ];
}

export function mandarinQuestionNarration(lesson: Lesson, question: Question, traceFallback: boolean, fullDirections: boolean): SpeechSegment[] {
  const say = (text: string): SpeechSegment[] => [{ text, language: "zh" }];
  const example: SpeechSegment = { text: practiceSpeech(question.word), language: "zh" };
  // English target words remain study content. Saying their Chinese translation
  // here would give away the answer to a recognition question.
  if (question.mode === "recognize" || question.mode === "trace" && traceFallback) {
    return [...say(fullDirections ? "听听这个英文词，选出对应的汉字。" : "找一找。"), { text: question.word.english, language: "en" }];
  }
  switch (question.mode) {
    case "meaning":
    case "listen": return fullDirections ? [...say(`听听这个${lesson.kind === "sentences" ? "句子" : "词语"}，选出正确的意思。点小喇叭可以听选项。`), example] : [example];
    case "sound": return fullDirections ? [...say("听一听，选出发这个音的字母。"), example] : [example];
    case "trace": return fullDirections ? [...say("用手指跟着亮起来的线写，再写下一笔。"), example] : [example];
    case "count": return say(fullDirections ? "数数圆点，选出对应的中文数字。" : "有几个圆点？");
    case "compare": return say(fullDirections ? "数数两边的鱼。左边更多、更少，还是一样多？选出对应的汉字。点小喇叭可以听发音。" : "更多、更少，还是一样多？");
    case "order": return say(fullDirections ? "顺着这一行数一数，选出空格里缺少的数字。" : "少了哪个数字？");
    case "sound-read": return say(fullDirections ? "看看上面的音节，选出对应的字母。" : "找出对应的字母。");
    default: return [];
  }
}
