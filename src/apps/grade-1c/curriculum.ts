// Source: Grade 1C, Week 1A (9/1–9/4), 2026–27 newsletter, pp. 1–2.
// The 12 vocabulary entries and three sentence patterns come from page 2.
// Number activities and completed sentence examples are original practice.
export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  icon: string;
  tip: string;
  value?: number;
  choiceLabel?: string;
  example?: { hanzi: string; pinyin: string; english: string };
};

export const SCHOOL: Word[] = [
  { id: "school", hanzi: "上学", pinyin: "shàng xué", english: "Go to school", icon: "🎒", tip: "Imagine putting on your backpack and heading to school." },
  { id: "teacher", hanzi: "老师", pinyin: "lǎo shī", english: "Teacher", icon: "🧑‍🏫", tip: "Point to someone who helps you learn." },
  { id: "student", hanzi: "学生", pinyin: "xué shēng", english: "Student", icon: "🧒", tip: "You are a student! Notice 学 in both 学生 and 上学." },
];

export const GREETINGS: Word[] = [
  { id: "morning", hanzi: "早安", pinyin: "zǎo ān", english: "Good morning", icon: "🌅", tip: "Say this when you see your teacher in the morning." },
  { id: "afternoon", hanzi: "午安", pinyin: "wǔ ān", english: "Good afternoon", icon: "☀️", tip: "Say this to greet someone in the afternoon." },
  { id: "night", hanzi: "晚安", pinyin: "wǎn ān", english: "Good night", icon: "🌙", tip: "Say this at bedtime. All three greetings end with 安." },
];

export const ACTIONS: Word[] = [
  { id: "stand", hanzi: "起立", pinyin: "qǐ lì", english: "Stand up", icon: "🧍", tip: "If you have space, stand up and say 起立." },
  { id: "sit", hanzi: "坐下", pinyin: "zuò xià", english: "Sit down", icon: "🪑", tip: "Sit down gently and say 坐下." },
  { id: "raise", hanzi: "举手", pinyin: "jǔ shǒu", english: "Raise your hand", icon: "🙋", tip: "Raise one hand, just like you do in class." },
  { id: "lower", hanzi: "放下", pinyin: "fàng xià", english: "Put it down", icon: "👇", tip: "Put your hand back down. You can put an object down, too." },
  { id: "wash", hanzi: "洗手", pinyin: "xǐ shǒu", english: "Wash your hands", icon: "🧼", tip: "Pretend to wash your hands. 手 means hand." },
  { id: "drink", hanzi: "喝水", pinyin: "hē shuǐ", english: "Drink water", icon: "💧", tip: "Pretend to take a sip of water. 水 means water." },
];

export const SENTENCES: Word[] = [
  {
    id: "my-name", hanzi: "你好，我叫__。", pinyin: "Nǐ hǎo, wǒ jiào __.", english: "Hello, my name is __.", icon: "👋",
    tip: "Now try saying your own name!", choiceLabel: "My name is Xiaoming.",
    example: { hanzi: "你好，我叫小明。", pinyin: "Nǐ hǎo, wǒ jiào Xiǎomíng.", english: "Hello, my name is Xiaoming." },
  },
  {
    id: "your-name", hanzi: "请问你叫什么名字？", pinyin: "Qǐngwèn nǐ jiào shénme míngzì?", english: "May I ask what your name is?", icon: "💬",
    tip: "Ask a friend their name!", choiceLabel: "What's your name?",
    example: { hanzi: "请问你叫什么名字？", pinyin: "Qǐngwèn nǐ jiào shénme míngzì?", english: "May I ask what your name is?" },
  },
  {
    id: "my-age", hanzi: "我今年__岁了。", pinyin: "Wǒ jīn nián __ suì le.", english: "I am __ years old.", icon: "🎂",
    tip: "Now try saying your own age!", choiceLabel: "I'm six years old.",
    example: { hanzi: "我今年六岁了。", pinyin: "Wǒ jīn nián liù suì le.", english: "I am six years old." },
  },
];

const NUMBER_ROWS = [
  ["零", "líng", "zero"], ["一", "yī", "one"], ["二", "èr", "two"],
  ["三", "sān", "three"], ["四", "sì", "four"], ["五", "wǔ", "five"],
  ["六", "liù", "six"], ["七", "qī", "seven"], ["八", "bā", "eight"],
  ["九", "jiǔ", "nine"], ["十", "shí", "ten"],
];

export const NUMBERS: Word[] = NUMBER_ROWS.map(([hanzi, pinyin, english], value) => ({
  id: `number-${value}`, hanzi, pinyin, english, value, icon: "🔢",
  tip: value === 0 ? "Zero means none. The counting frame is empty." : "Tap each filled dot and count out loud. Then say the Chinese number.",
}));

export type Lesson = { id: string; title: string; chinese: string; description: string; color: string; icon: string; words: Word[]; kind: "words" | "sentences" | "numbers" };

export const LESSONS: Lesson[] = [
  { id: "school", title: "Meet your class", chinese: "上学", description: "School, teacher, and student", color: "cyan", icon: "🎒", words: SCHOOL, kind: "words" },
  { id: "greetings", title: "Say hello", chinese: "早安", description: "Morning, afternoon, and night", color: "amber", icon: "☀️", words: GREETINGS, kind: "words" },
  { id: "actions", title: "Move & play", chinese: "举手", description: "Six things we do at school", color: "green", icon: "🙋", words: ACTIONS, kind: "words" },
  { id: "friends", title: "Make a friend", chinese: "你好", description: "Listen, tap, and say hello", color: "violet", icon: "👋", words: SENTENCES, kind: "sentences" },
  { id: "numbers", title: "Count with me", chinese: "一二三", description: "Numbers 0–10 in Chinese & English", color: "rose", icon: "🔢", words: NUMBERS, kind: "numbers" },
];
