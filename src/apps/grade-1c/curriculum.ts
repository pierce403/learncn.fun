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
  audioText?: string;
  soundCue?: string;
  related?: { hanzi: string; pinyin: string; english: string }[];
  sentence?: { hanzi: string; pinyin: string; english: string };
  pair?: [number, number];
  sequence?: number[];
  measure?: { before: string; after: string };
  parts?: [number, number];
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

export type Lesson = { id: string; week: number; title: string; chinese: string; description: string; color: string; icon: string; words: Word[]; kind: "words" | "sentences" | "numbers" | "sounds" | "writing" | "compare" | "order" | "measures" | "bonds" | "addition" };

export const WEEK_1_LESSONS: Lesson[] = [
  { id: "school", week: 1, title: "Meet your class", chinese: "上学", description: "School, teacher, and student", color: "cyan", icon: "🎒", words: SCHOOL, kind: "words" },
  { id: "greetings", week: 1, title: "Say hello", chinese: "早安", description: "Morning, afternoon, and night", color: "amber", icon: "☀️", words: GREETINGS, kind: "words" },
  { id: "actions", week: 1, title: "Move & play", chinese: "举手", description: "Six things we do at school", color: "green", icon: "🙋", words: ACTIONS, kind: "words" },
  { id: "friends", week: 1, title: "Make a friend", chinese: "你好", description: "Listen, tap, and say hello", color: "violet", icon: "👋", words: SENTENCES, kind: "sentences" },
  { id: "numbers", week: 1, title: "Count with me", chinese: "一二三", description: "Numbers 0–10 in Chinese & English", color: "rose", icon: "🔢", words: NUMBERS, kind: "numbers" },
];

// Week 2B (9/8–9/11), 2026–27 newsletter, p. 2: seven finals, two
// initials, five recognition characters, and five writing characters.
// Spoken examples teach sounds in syllables, not English letter names.
export const FINALS: Word[] = [
  { id: "w2-a", hanzi: "a", pinyin: "ā", english: "Open wide: ah", icon: "🗣️", tip: "Open your mouth wide. Keep your tongue low and copy the sound.", audioText: "阿", soundCue: "Find the sound in ā." },
  { id: "w2-o", hanzi: "o", pinyin: "ō", english: "Round lips: oh", icon: "🗣️", tip: "Make a circle with your lips. Keep it still as you copy the sound.", audioText: "喔", soundCue: "Find the sound in ō." },
  { id: "w2-e", hanzi: "e", pinyin: "é", english: "Relax your lips", icon: "🗣️", tip: "Open your mouth a little. Keep your tongue back and your lips relaxed. Listen and copy.", audioText: "鹅", soundCue: "Find the sound in é." },
  { id: "w2-i", hanzi: "i", pinyin: "yī", english: "Smile: ee", icon: "🗣️", tip: "Smile and say “ee,” like in “see.” Listen and copy.", audioText: "衣", soundCue: "Find the ending sound in yī." },
  { id: "w2-u", hanzi: "u", pinyin: "wū", english: "Round lips: oo", icon: "🗣️", tip: "Round your lips and say “oo,” like in “moon.” Listen and copy.", audioText: "屋", soundCue: "Find the ending sound in wū." },
  { id: "w2-umlaut", hanzi: "ü", pinyin: "nǚ", english: "Ee with round lips", icon: "🗣️", tip: "Say “ee.” Keep your tongue still, then round your lips. Try it at the end of nǚ.", audioText: "女", soundCue: "Find the ending sound in nǚ." },
  { id: "w2-er", hanzi: "er", pinyin: "ěr", english: "Lift your tongue tip", icon: "🗣️", tip: "Lift your tongue tip a little without touching the roof of your mouth. Listen and copy.", audioText: "耳", soundCue: "Find the sound in ěr." },
];
export const INITIALS: Word[] = [
  { id: "w2-y", hanzi: "y", pinyin: "yī", english: "Start with y", icon: "👕", tip: "Look at the first letter in yī.", audioText: "衣", soundCue: "What starts yī?" },
  { id: "w2-w", hanzi: "w", pinyin: "wǔ", english: "Start with w", icon: "🖐️", tip: "Look at the first letter in wǔ.", audioText: "五", soundCue: "What starts wǔ?" },
];

export const WEEK_2_READING: Word[] = [
  { id: "w2-clothes", hanzi: "衣", pinyin: "yī", english: "Clothes", icon: "👕", tip: "Point to your clothes.",
    related: [{ hanzi: "衣服", pinyin: "yīfu", english: "clothes" }, { hanzi: "雨衣", pinyin: "yǔyī", english: "raincoat" }],
    sentence: { hanzi: "我有一件雨衣。", pinyin: "Wǒ yǒu yí jiàn yǔyī.", english: "I have a raincoat." } },
  { id: "w2-fish", hanzi: "鱼", pinyin: "yú", english: "Fish", icon: "🐟", tip: "Wiggle your hand like a little fish.",
    related: [{ hanzi: "小鱼", pinyin: "xiǎo yú", english: "little fish" }, { hanzi: "金鱼", pinyin: "jīnyú", english: "goldfish" }],
    sentence: { hanzi: "我有一条小鱼。", pinyin: "Wǒ yǒu yì tiáo xiǎo yú.", english: "I have a little fish." } },
  { id: "w2-rain", hanzi: "雨", pinyin: "yǔ", english: "Rain", icon: "🌧️", tip: "Wiggle your fingers like falling rain.",
    related: [{ hanzi: "下雨", pinyin: "xià yǔ", english: "to rain" }, { hanzi: "雨衣", pinyin: "yǔyī", english: "raincoat" }],
    sentence: { hanzi: "今天下雨了。", pinyin: "Jīntiān xià yǔ le.", english: "It rained today." } },
  { id: "w2-ear", hanzi: "耳", pinyin: "ěr", english: "Ear", icon: "👂", tip: "Point to your ear and listen.",
    related: [{ hanzi: "耳朵", pinyin: "ěrduo", english: "ear" }, { hanzi: "木耳", pinyin: "mù'ěr", english: "wood ear mushroom" }],
    sentence: { hanzi: "我有两只耳朵。", pinyin: "Wǒ yǒu liǎng zhī ěrduo.", english: "I have two ears." } },
  { id: "w2-tooth", hanzi: "牙", pinyin: "yá", english: "Tooth", icon: "🦷", tip: "Smile and show your teeth.",
    related: [{ hanzi: "牙齿", pinyin: "yáchǐ", english: "teeth" }, { hanzi: "刷牙", pinyin: "shuā yá", english: "brush teeth" }],
    sentence: { hanzi: "我的牙齿很白。", pinyin: "Wǒ de yáchǐ hěn bái.", english: "My teeth are very white." } },
];
export const WEEK_2_WRITING: Word[] = [
  { id: "w2-one", hanzi: "一", pinyin: "yī", english: "One", icon: "☝️", tip: "One stroke, from left to right.",
    related: [{ hanzi: "一个", pinyin: "yí ge", english: "one (of something)" }, { hanzi: "一天", pinyin: "yì tiān", english: "one day" }],
    sentence: { hanzi: "我有一个书包。", pinyin: "Wǒ yǒu yí ge shūbāo.", english: "I have a schoolbag." } },
  { id: "w2-two", hanzi: "二", pinyin: "èr", english: "Two", icon: "✌️", tip: "Write the top line, then the bottom line.",
    related: [{ hanzi: "二月", pinyin: "èr yuè", english: "February" }, { hanzi: "二人", pinyin: "èr rén", english: "two people" }],
    sentence: { hanzi: "我排第二。", pinyin: "Wǒ pái dì èr.", english: "I am second in line." } },
  { id: "w2-five", hanzi: "五", pinyin: "wǔ", english: "Five", icon: "🖐️", tip: "Follow each glowing stroke.",
    related: [{ hanzi: "五个", pinyin: "wǔ ge", english: "five (of something)" }, { hanzi: "五月", pinyin: "wǔ yuè", english: "May" }],
    // Correct the newsletter's duplicated 有 in this example.
    sentence: { hanzi: "我有五个苹果。", pinyin: "Wǒ yǒu wǔ ge píngguǒ.", english: "I have five apples." } },
  { id: "w2-mouth", hanzi: "口", pinyin: "kǒu", english: "Mouth", icon: "👄", tip: "Three strokes make this little square.",
    related: [{ hanzi: "门口", pinyin: "ménkǒu", english: "doorway" }, { hanzi: "人口", pinyin: "rénkǒu", english: "population" }],
    sentence: { hanzi: "我有一张口。", pinyin: "Wǒ yǒu yì zhāng kǒu.", english: "I have a mouth." } },
  { id: "w2-person", hanzi: "人", pinyin: "rén", english: "Person", icon: "🧍", tip: "Two strokes, like two legs.",
    related: [{ hanzi: "大人", pinyin: "dàren", english: "adult" }, { hanzi: "家人", pinyin: "jiārén", english: "family member" }],
    sentence: { hanzi: "我的妈妈是一个大人。", pinyin: "Wǒ de māma shì yí ge dàren.", english: "My mom is an adult." } },
];

// Original games for the comparison and ordering objectives on p. 1.
export const COMPARISONS: Word[] = [
  { id: "w2-more", hanzi: "大于", pinyin: "dà yú", english: "More", icon: "🐟", audioText: "大于", tip: "The left group has more fish than the right group.", pair: [5, 2] },
  { id: "w2-less", hanzi: "小于", pinyin: "xiǎo yú", english: "Less", icon: "🐟", audioText: "小于", tip: "The left group has fewer fish than the right group.", pair: [2, 5] },
  { id: "w2-same", hanzi: "等于", pinyin: "děng yú", english: "Same", icon: "🐟", audioText: "等于", tip: "Three and three are the same.", pair: [3, 3] },
];
export const ORDERING: Word[] = [
  { id: "w2-up", hanzi: "0 → 1 → 2", pinyin: "líng → yī → èr", english: "Count up", icon: "🔢", audioText: "零，一，二", tip: "Each number gets one bigger.", sequence: [0, 1, 2] },
  { id: "w2-down", hanzi: "3 → 2 → 1", pinyin: "sān → èr → yī", english: "Count down", icon: "🔢", audioText: "三，二，一", tip: "Each number gets one smaller.", sequence: [3, 2, 1] },
];
export const WEEK_2_LESSONS: Lesson[] = [
  { id: "w2-finals", week: 2, title: "Sound explorers", chinese: "a o e i u ü er", description: "Seven pinyin sounds to hear and tap", color: "cyan", icon: "🗣️", words: FINALS, kind: "sounds" },
  { id: "w2-initials", week: 2, title: "Hello, y and w", chinese: "y · w", description: "Find the first letter", color: "violet", icon: "👋", words: INITIALS, kind: "sounds" },
  { id: "w2-reading", week: 2, title: "Fish & friends", chinese: "衣 鱼 雨 耳 牙", description: "Clothes, fish, rain, ears, and teeth", color: "green", icon: "🐟", words: WEEK_2_READING, kind: "words" },
  { id: "w2-writing", week: 2, title: "Trace with me", chinese: "一 二 五 口 人", description: "Follow the strokes with your finger", color: "amber", icon: "✏️", words: WEEK_2_WRITING, kind: "writing" },
  { id: "w2-compare", week: 2, title: "More or less?", chinese: "大于 小于 等于", description: "Compare groups of fish", color: "rose", icon: "🐟", words: COMPARISONS, kind: "compare" },
  { id: "w2-order", week: 2, title: "Number neighbors", chinese: "1 → 2 → 3", description: "Tap the missing number", color: "cyan", icon: "🔢", words: ORDERING, kind: "order" },
];

// Week 3A (9/14–9/18), 2026–27 newsletter, p. 2: Lesson 2 family
// vocabulary and four sentence patterns. Pinyin preserves the sheet's tones.
export const WEEK_3_GROWNUPS: Word[] = [
  { id: "w3-grandfather", hanzi: "爷爷", pinyin: "yé yé", english: "Grandfather", icon: "👴", tip: "Your dad's dad is your grandfather." },
  { id: "w3-grandmother", hanzi: "奶奶", pinyin: "nǎi nǎi", english: "Grandmother", icon: "👵", tip: "Your dad's mom is your grandmother." },
  { id: "w3-father", hanzi: "爸爸", pinyin: "bà bà", english: "Father", icon: "👨", tip: "This is how to say dad." },
  { id: "w3-mother", hanzi: "妈妈", pinyin: "mā mā", english: "Mother", icon: "👩", tip: "This is how to say mom." },
];
export const WEEK_3_SIBLINGS: Word[] = [
  { id: "w3-older-brother", hanzi: "哥哥", pinyin: "gē gē", english: "Older brother", icon: "👦", tip: "A brother who is older than you." },
  { id: "w3-older-sister", hanzi: "姐姐", pinyin: "jiě jiě", english: "Older sister", icon: "👧", tip: "A sister who is older than you." },
  { id: "w3-younger-brother", hanzi: "弟弟", pinyin: "dì di", english: "Younger brother", icon: "👦", tip: "A brother who is younger than you." },
  { id: "w3-younger-sister", hanzi: "妹妹", pinyin: "mèi mèi", english: "Younger sister", icon: "👧", tip: "A sister who is younger than you." },
];
export const WEEK_3_FAMILY: Word[] = [
  { id: "w3-family", hanzi: "家人", pinyin: "jiā rén", english: "Family members", icon: "🏠", tip: "The people in a family. Every family is different." },
  { id: "w3-parents", hanzi: "父母", pinyin: "fù mǔ", english: "Parents", icon: "🧑‍🧑‍🧒", tip: "A mother and a father are parents." },
  { id: "w3-son", hanzi: "儿子", pinyin: "ér zi", english: "Son", icon: "👦", tip: "A parent's boy is their son." },
  { id: "w3-daughter", hanzi: "女儿", pinyin: "nǚ ér", english: "Daughter", icon: "👧", tip: "A parent's girl is their daughter." },
];
export const WEEK_3_SENTENCES: Word[] = [
  { id: "w3-who", hanzi: "他是谁？", pinyin: "Tā shì shuí?", english: "Who is he?", icon: "❓", tip: "Ask who someone is.", choiceLabel: "Who is he?" },
  { id: "w3-my-grandfather", hanzi: "他是我的爷爷。", pinyin: "Tā shì wǒ de yé yé.", english: "He is my grandfather.", icon: "👴", tip: "Try introducing someone in a pretend family.", choiceLabel: "He is my grandfather." },
  { id: "w3-family-question", hanzi: "你家有几个人？", pinyin: "Nǐ jiā yǒu jǐ gè rén?", english: "How many people are in your family?", icon: "🏠", tip: "Ask how many people are in a family.", choiceLabel: "How many people are in your family?" },
  { id: "w3-family-six", hanzi: "我家有六个人。", pinyin: "Wǒ jiā yǒu liù gè rén.", english: "There are six people in my family.", icon: "🖐️", tip: "Six is just our example. Families can be different sizes.", choiceLabel: "There are six people in my family." },
];

// Page 1 names measure words without prescribing a list. These original
// exercises reuse people and the fish, raincoat, and ears from Week 2 examples.
export const WEEK_3_MEASURES: Word[] = [
  { id: "w3-measure-person", hanzi: "个", pinyin: "gè", english: "One person", icon: "🧍", tip: "Use 个 to count people.", measure: { before: "一", after: "人" }, example: { hanzi: "一个人", pinyin: "yí ge rén", english: "One person" } },
  { id: "w3-measure-fish", hanzi: "条", pinyin: "tiáo", english: "One fish", icon: "🐟", tip: "Use 条 to count fish.", measure: { before: "一", after: "鱼" }, example: { hanzi: "一条鱼", pinyin: "yì tiáo yú", english: "One fish" } },
  { id: "w3-measure-raincoat", hanzi: "件", pinyin: "jiàn", english: "One raincoat", icon: "🧥", tip: "Use 件 to count raincoats.", measure: { before: "一", after: "雨衣" }, example: { hanzi: "一件雨衣", pinyin: "yí jiàn yǔyī", english: "One raincoat" } },
  { id: "w3-measure-ears", hanzi: "只", pinyin: "zhī", english: "Two ears", icon: "👂", tip: "Use 只 to count ears.", measure: { before: "两", after: "耳朵" }, example: { hanzi: "两只耳朵", pinyin: "liǎng zhī ěrduo", english: "Two ears" } },
];

// Original visual practice for number composition and addition within 10 (p. 1).
function sumCards(id: string, pairs: [number, number][]): Word[] {
  return pairs.map(([left, right]) => ({
    id: `${id}-${left}-${right}`, parts: [left, right], icon: "🔢",
    hanzi: `${NUMBERS[left].hanzi}加${NUMBERS[right].hanzi}等于${NUMBERS[left + right].hanzi}`,
    pinyin: `${NUMBERS[left].pinyin} jiā ${NUMBERS[right].pinyin} děng yú ${NUMBERS[left + right].pinyin}`,
    english: `${left} plus ${right} equals ${left + right}`,
    tip: id === "w3-bond" ? "Two small groups make one whole group." : "Count both colors together to find the total.",
  }));
}
export const WEEK_3_BONDS = sumCards("w3-bond", [[1, 2], [2, 3], [4, 2], [3, 4], [5, 5]]);
export const WEEK_3_ADDITION = sumCards("w3-add", [[2, 1], [3, 2], [4, 0], [2, 4], [4, 4], [6, 4], [0, 0]]);

export const WEEK_3_LESSONS: Lesson[] = [
  { id: "w3-grownups", week: 3, title: "Meet the family", chinese: "爷爷 奶奶 爸爸 妈妈", description: "Grandparents, dad, and mom", color: "green", icon: "🏠", words: WEEK_3_GROWNUPS, kind: "words" },
  { id: "w3-siblings", week: 3, title: "Brothers & sisters", chinese: "哥哥 姐姐 弟弟 妹妹", description: "Older and younger siblings", color: "cyan", icon: "👧", words: WEEK_3_SIBLINGS, kind: "words" },
  { id: "w3-family", week: 3, title: "Family words", chinese: "家人 父母 儿子 女儿", description: "Family, parents, son, and daughter", color: "rose", icon: "🏡", words: WEEK_3_FAMILY, kind: "words" },
  { id: "w3-sentences", week: 3, title: "Who is he?", chinese: "他是谁？", description: "Talk about a family", color: "violet", icon: "💬", words: WEEK_3_SENTENCES, kind: "sentences" },
  { id: "w3-measures", week: 3, title: "Counting words", chinese: "个 条 件 只", description: "Pick the little word in the gap", color: "amber", icon: "🐟", words: WEEK_3_MEASURES, kind: "measures" },
  { id: "w3-bonds", week: 3, title: "Make a number", chinese: "分一分 合一合", description: "Find the missing part", color: "green", icon: "🧩", words: WEEK_3_BONDS, kind: "bonds" },
  { id: "w3-addition", week: 3, title: "Add with me", chinese: "十以内加法", description: "Put two groups together", color: "cyan", icon: "➕", words: WEEK_3_ADDITION, kind: "addition" },
];

export const WEEKS = [
  { number: 1, title: "I go to school", dates: "Sep 1–4", lessons: WEEK_1_LESSONS },
  { number: 2, title: "Sounds & new friends", dates: "Sep 8–11", lessons: WEEK_2_LESSONS },
  { number: 3, title: "Family & counting", dates: "Sep 14–18", lessons: WEEK_3_LESSONS },
];
export const LESSONS: Lesson[] = WEEKS.flatMap((week) => week.lessons);
export function practiceSpeech(word: Word): string { return word.audioText ?? word.example?.hanzi ?? word.hanzi; }
