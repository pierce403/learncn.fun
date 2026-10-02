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
  "w3-grownups": "一起来认识家人！听听爷爷奶奶、爸爸妈妈怎么说。准备好了，就点下一张。",
  "w3-siblings": "一起来认识兄弟姐妹！听一听，谁比你大，谁比你小？准备好了，就点下一张。",
  "w3-family": "一起来学更多家人的词语！听一听，跟着说。准备好了，就点下一张。",
  "w3-sentences": "一起来介绍家人！听一句，跟着说一句。准备好了，就点下一张。",
  "w3-measures": "一起来学量词！数字和事物之间，要用合适的量词。听一听，再点下一张。",
  "w3-bonds": "一起来分一分、合一合！圆点和菱形合起来，一共有几个？准备好了，就点下一张。",
  "w3-addition": "一起来做加法！把两组放在一起，数数一共有几个。准备好了，就点下一张。",
  "w4-lip-sounds": "一起来学声母！用嘴唇发音，试试送气和不送气。听一听，跟着读，再点下一张。",
  "w4-tongue-sounds": "一起来学更多声母！舌尖轻轻碰上面的牙齿后面。听一听，跟着读，再点下一张。",
  "w4-you-and-me": "一起来认汉字！听一听，找找汉字在词语里的位置。准备好了，就点下一张。",
  "w4-at-home": "一起来认识家人的汉字！仔细看，听一听，跟着读。准备好了，就点下一张。",
  "w4-my-family": "一起来认更多汉字！他和她的读音一样，看看左边有什么不同。准备好了，就点下一张。",
  "w4-trace-nature": "一起来写四个汉字！先看看字，听听怎么读。准备好了，就点下一张。",
  "w4-trace-family": "一起来写三个汉字！先看看字，听听怎么读。准备好了，就点下一张。",
  "w4-i-have": "一起来说我有！听一句，跟着说一句。准备好了，就点下一张。",
  "w4-number-line": "一起来跳数线！从第一个数开始，往前跳，看看到了几。准备好了，就点下一张。",
  "w4-dice": "一起来数骰子！点一点两颗骰子的圆点，数数一共有几个。准备好了，就点下一张。",
  "w4-stories": "一起来听加法故事！找出两组，把它们加起来。准备好了，就点下一张。",
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
  b: "双唇闭上再打开，轻轻发音，不要用力送气。",
  p: "双唇闭上再打开，送出一口气，试试用手感觉气流。",
  m: "双唇闭上，用鼻子哼一哼，再打开嘴。",
  f: "上面的牙齿轻轻碰下嘴唇，让气流出来。",
  d: "舌尖碰上齿后面，再轻轻放开，不要用力送气。",
  t: "舌尖碰上齿后面，再放开，送出一口气。",
  n: "舌尖碰上齿后面，用鼻子哼一哼。",
  l: "舌尖碰上齿后面，让气从舌头两边出来。",
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
  "w3-grandfather": "爸爸的爸爸叫爷爷。",
  "w3-grandmother": "爸爸的妈妈叫奶奶。",
  "w3-father": "这是爸爸。跟着说一说。",
  "w3-mother": "这是妈妈。跟着说一说。",
  "w3-older-brother": "比你大的兄弟叫哥哥。",
  "w3-older-sister": "比你大的姐妹叫姐姐。",
  "w3-younger-brother": "比你小的兄弟叫弟弟。",
  "w3-younger-sister": "比你小的姐妹叫妹妹。",
  "w3-family": "家里的人是家人。每个家庭都不一样。",
  "w3-parents": "爸爸和妈妈是父母。",
  "w3-son": "男孩子是父母的儿子。",
  "w3-daughter": "女孩子是父母的女儿。",
  "w3-who": "问一问，他是谁？",
  "w3-my-grandfather": "试着介绍一个故事里的家人。",
  "w3-family-question": "问问一个家里有几个人。",
  "w3-family-six": "六个人只是一个例子。每个家庭的人数可能不一样。",
  "w3-measure-person": "数人可以用量词个。",
  "w3-measure-fish": "数鱼可以用量词条。",
  "w3-measure-raincoat": "数雨衣可以用量词件。",
  "w3-measure-ears": "数耳朵可以用量词只。",
  "w4-horse": "找找木马和马路里的马字。",
  "w4-ba": "巴是巴士和嘴巴里的一个字。",
  "w4-you": "对着和你说话的人，可以说你。",
  "w4-me": "指指自己，跟着说我。",
  "w4-he": "他和她的读音一样。看看这个他的左边，是单人旁。",
  "w4-brother": "两个弟字组成弟弟，指比你小的兄弟。",
  "w4-dad": "这是爸爸里的爸字。",
  "w4-she": "她和他的读音一样。看看这个她的左边，是女字旁。",
  "w4-mom": "这是妈妈里的妈字。",
  "w4-de": "我后面加一个的，就变成我的。",
  "w4-father": "父母里的第一个字是父。",
  "w4-mother": "父母里的第二个字是母。",
  "w4-wood": "四笔写成木，像一棵有树枝的树。",
  "w4-earth": "三笔写成土，下面的一横像地面。",
  "w4-eight": "八的两笔向两边分开。",
  "w4-also": "跟着亮起来的笔画写也。试着说，他也是我的同学。",
  "w4-not": "不表示否定。在另一个第四声前面，这个字的读音变成第二声。",
  "w4-female": "女儿里有女字，她的左边也是女字旁。",
  "w4-child": "儿子和女儿里都有儿字。",
  "w4-have-brother": "试着介绍一个故事里的家人。",
  "w4-have-bag": "说说你有什么。",
  "w4-have-fish": "数鱼可以用量词条。",
};

export function mandarinCardNarration(word: Word, includeTip: boolean): SpeechSegment[] {
  const tip = word.mathModel === "number-line" ? "从第一个数开始，往前跳，看看到了几。" : word.mathModel === "dice" ? "数数两颗骰子的圆点，一共有几个？" : word.parts ? "把两组放在一起，数数一共有几个。" : word.soundCue ? SOUND_TIPS[word.hanzi] : word.value !== undefined
    ? word.value === 0 ? "零就是一个也没有。这里没有圆点。" : "一个一个地点圆点，数一数，再读出这个数字。"
    : WORD_TIPS[word.id];
  return [
    ...(word.story ? [{ text: word.story.zh, language: "zh" as const }] : []),
    ...(includeTip || word.soundCue ? [{ text: tip ?? "听一听，跟着读。", language: "zh" as const }] : []),
    { text: practiceSpeech(word), language: "zh" },
  ];
}

export function mandarinQuestionNarration(lesson: Lesson, question: Question, traceFallback: boolean, fullDirections: boolean): SpeechSegment[] {
  const say = (text: string): SpeechSegment[] => [{ text, language: "zh" }];
  if (question.mode === "addition" && (question.story || question.mathModel)) {
    const text = question.story?.zh ?? (question.mathModel === "number-line"
      ? `从${question.parts![0]}开始，往前跳${question.parts![1]}次。到了几？`
      : "数数两颗骰子的圆点，一共有几个？");
    return say(`${text}${fullDirections ? "选出对应的中文数字。" : ""}`);
  }
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
    case "measure": return say(fullDirections ? "看看空格前后的汉字，选出合适的量词。" : "选哪个量词？");
    case "bonds": return say(fullDirections ? "数数菱形，选出空格里缺少的中文数字。" : "有几个菱形？");
    case "addition": return say(fullDirections ? "把两组放在一起数一数，选出一共有几个。" : "一共有几个？");
    default: return [];
  }
}
