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
  mathModel?: "number-line" | "dice";
  story?: { en: string; zh: string };
  requiresWrittenPrompt?: boolean;
  meaningGroup?: string;
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

// Week 4B (9/21–9/25), 2026–27 newsletter, pp. 1–2.
// Exact recognition/writing lists and word-building examples from p. 2.
export const WEEK_4_INITIALS: Word[] = [
  { id: "w4-b", hanzi: "b", pinyin: "bā", english: "Lips pop gently", icon: "🗣️", tip: "Close your lips, then open them with very little air.", audioText: "八", soundCue: "What starts bā?" },
  { id: "w4-p", hanzi: "p", pinyin: "pā", english: "Lips pop with air", icon: "🗣️", tip: "Close your lips, then open them with a puff of air. Feel it on your hand.", audioText: "趴", soundCue: "What starts pā?" },
  { id: "w4-m", hanzi: "m", pinyin: "mā", english: "Lips hum", icon: "🗣️", tip: "Close your lips and hum, then open them.", audioText: "妈", soundCue: "What starts mā?" },
  { id: "w4-f", hanzi: "f", pinyin: "fā", english: "Teeth and lip", icon: "🗣️", tip: "Rest your top teeth gently on your bottom lip and let air flow.", audioText: "发", soundCue: "What starts fā?" },
  { id: "w4-d", hanzi: "d", pinyin: "dā", english: "Tongue taps gently", icon: "🗣️", tip: "Touch your tongue behind your top teeth, then release it with very little air.", audioText: "搭", soundCue: "What starts dā?" },
  { id: "w4-t", hanzi: "t", pinyin: "tā", english: "Tongue taps with air", icon: "🗣️", tip: "Touch your tongue behind your top teeth, then release it with a puff of air.", audioText: "他", soundCue: "What starts tā?" },
  { id: "w4-n", hanzi: "n", pinyin: "ná", english: "Tongue taps and hums", icon: "🗣️", tip: "Touch your tongue behind your top teeth and hum through your nose.", audioText: "拿", soundCue: "What starts ná?" },
  { id: "w4-l", hanzi: "l", pinyin: "lā", english: "Air around the tongue", icon: "🗣️", tip: "Touch your tongue behind your top teeth. Let air flow around its sides.", audioText: "拉", soundCue: "What starts lā?" },
];
export const WEEK_4_READING: Word[] = [
  { id: "w4-horse", hanzi: "马", pinyin: "mǎ", english: "Horse", icon: "🐴", tip: "Find the horse character inside wooden horse and road.",
    related: [{ hanzi: "木马", pinyin: "mùmǎ", english: "wooden horse" }, { hanzi: "马路", pinyin: "mǎlù", english: "road" }],
    sentence: { hanzi: "弟弟喜欢骑木马。", pinyin: "Dìdi xǐhuan qí mùmǎ.", english: "Little brother likes riding a wooden horse." } },
  { id: "w4-ba", hanzi: "巴", pinyin: "bā", english: "Ba in bus and mouth", icon: "🚌", tip: "This character is part of 巴士, bus, and 嘴巴, mouth. It does not mean bus by itself.",
    related: [{ hanzi: "巴士", pinyin: "bāshì", english: "bus" }, { hanzi: "嘴巴", pinyin: "zuǐba", english: "mouth" }],
    sentence: { hanzi: "我坐巴士上学。", pinyin: "Wǒ zuò bāshì shàngxué.", english: "I take the bus to school." } },
  { id: "w4-you", hanzi: "你", pinyin: "nǐ", english: "You", icon: "👋", tip: "Say this to the person you are talking to.",
    related: [{ hanzi: "你好", pinyin: "nǐ hǎo", english: "hello" }, { hanzi: "你们", pinyin: "nǐmen", english: "you (more than one person)" }],
    sentence: { hanzi: "我对老师说：“你好！”", pinyin: "Wǒ duì lǎoshī shuō: “Nǐ hǎo!”", english: "I say hello to the teacher." } },
  { id: "w4-me", hanzi: "我", pinyin: "wǒ", english: "I / me", icon: "🙋", tip: "Point to yourself and say it.",
    related: [{ hanzi: "我们", pinyin: "wǒmen", english: "we" }, { hanzi: "我的", pinyin: "wǒ de", english: "my / mine" }],
    sentence: { hanzi: "我们都是好朋友。", pinyin: "Wǒmen dōu shì hǎo péngyou.", english: "We are all good friends." } },
  { id: "w4-he", hanzi: "他", pinyin: "tā", english: "He", icon: "👦", tip: "He and she sound the same. Look at the left side: 他 has the person part.", requiresWrittenPrompt: true,
    related: [{ hanzi: "他们", pinyin: "tāmen", english: "they" }, { hanzi: "他的", pinyin: "tā de", english: "his" }],
    sentence: { hanzi: "他们在操场上跑步。", pinyin: "Tāmen zài cāochǎng shàng pǎobù.", english: "They are running on the playground." } },
  { id: "w4-brother", hanzi: "弟", pinyin: "dì", english: "Younger brother", icon: "👦", tip: "Say it twice to make 弟弟, younger brother.",
    related: [{ hanzi: "弟弟", pinyin: "dìdi", english: "younger brother" }, { hanzi: "兄弟", pinyin: "xiōngdì", english: "brothers" }],
    sentence: { hanzi: "弟弟今年五岁。", pinyin: "Dìdi jīnnián wǔ suì.", english: "Little brother is five years old this year." } },
  { id: "w4-dad", meaningGroup: "father", hanzi: "爸", pinyin: "bà", english: "Dad", icon: "👨", tip: "This is the character in 爸爸, dad.",
    related: [{ hanzi: "爸爸", pinyin: "bàba", english: "dad" }, { hanzi: "爸妈", pinyin: "bàmā", english: "dad and mom" }],
    sentence: { hanzi: "爸爸在看书。", pinyin: "Bàba zài kàn shū.", english: "Dad is reading a book." } },
  { id: "w4-she", hanzi: "她", pinyin: "tā", english: "She", icon: "👧", tip: "She and he sound the same. Look at the left side: 她 has the 女 part.", requiresWrittenPrompt: true,
    related: [{ hanzi: "她们", pinyin: "tāmen", english: "they (female)" }, { hanzi: "她的", pinyin: "tā de", english: "her / hers" }],
    sentence: { hanzi: "她们都是我的朋友。", pinyin: "Tāmen dōu shì wǒ de péngyou.", english: "They are all my friends." } },
  { id: "w4-mom", meaningGroup: "mother", hanzi: "妈", pinyin: "mā", english: "Mom", icon: "👩", tip: "This is the character in 妈妈, mom.",
    related: [{ hanzi: "妈妈", pinyin: "māma", english: "mom" }, { hanzi: "爸妈", pinyin: "bàmā", english: "dad and mom" }],
    sentence: { hanzi: "妈妈在做饭。", pinyin: "Māma zài zuò fàn.", english: "Mom is cooking." } },
  { id: "w4-de", hanzi: "的", pinyin: "de", english: "Belonging word", icon: "🎒", tip: "Put 的 after 我 to make 我的: my or mine.", audioText: "我的",
    related: [{ hanzi: "我的", pinyin: "wǒ de", english: "my / mine" }, { hanzi: "你的", pinyin: "nǐ de", english: "your / yours" }],
    sentence: { hanzi: "这是我的书包。", pinyin: "Zhè shì wǒ de shūbāo.", english: "This is my schoolbag." } },
  { id: "w4-father", meaningGroup: "father", hanzi: "父", pinyin: "fù", english: "Father", icon: "👨", tip: "Find this character at the start of 父母, parents.",
    related: [{ hanzi: "父母", pinyin: "fùmǔ", english: "parents" }, { hanzi: "父亲", pinyin: "fùqīn", english: "father" }],
    sentence: { hanzi: "这是我的父母。", pinyin: "Zhè shì wǒ de fùmǔ.", english: "These are my parents." } },
  { id: "w4-mother", meaningGroup: "mother", hanzi: "母", pinyin: "mǔ", english: "Mother", icon: "👩", tip: "Find this character at the end of 父母, parents.",
    related: [{ hanzi: "父母", pinyin: "fùmǔ", english: "parents" }, { hanzi: "母亲", pinyin: "mǔqīn", english: "mother" }],
    sentence: { hanzi: "我爱我的父母。", pinyin: "Wǒ ài wǒ de fùmǔ.", english: "I love my parents." } },
];
export const WEEK_4_WRITING: Word[] = [
  { id: "w4-wood", hanzi: "木", pinyin: "mù", english: "Wood", icon: "🌳", tip: "Follow four strokes, like a tree with branches.",
    related: [{ hanzi: "木头", pinyin: "mùtou", english: "wood" }, { hanzi: "木马", pinyin: "mùmǎ", english: "wooden horse" }],
    sentence: { hanzi: "这张桌子是木头做的。", pinyin: "Zhè zhāng zhuōzi shì mùtou zuò de.", english: "This table is made of wood." } },
  { id: "w4-earth", hanzi: "土", pinyin: "tǔ", english: "Earth / soil", icon: "🌱", tip: "Three strokes. The bottom line is the ground.",
    related: [{ hanzi: "土地", pinyin: "tǔdì", english: "land" }, { hanzi: "泥土", pinyin: "nítǔ", english: "soil" }],
    sentence: { hanzi: "小草长在土地上。", pinyin: "Xiǎocǎo zhǎng zài tǔdì shàng.", english: "Grass grows on the land." } },
  { id: "w4-eight", hanzi: "八", pinyin: "bā", english: "Eight", icon: "🔢", tip: "Two strokes spread apart.",
    related: [{ hanzi: "八个", pinyin: "bā ge", english: "eight (of something)" }, { hanzi: "八月", pinyin: "bā yuè", english: "August" }],
    sentence: { hanzi: "篮子里有八个橙。", pinyin: "Lánzi lǐ yǒu bā ge chéng.", english: "There are eight oranges in the basket." } },
  { id: "w4-also", hanzi: "也", pinyin: "yě", english: "Also", icon: "🙋", tip: "Follow the glowing strokes. This word means also.",
    related: [{ hanzi: "也是", pinyin: "yě shì", english: "also is" }, { hanzi: "也好", pinyin: "yě hǎo", english: "also good" }],
    sentence: { hanzi: "他也是我的同学。", pinyin: "Tā yě shì wǒ de tóngxué.", english: "He is also my classmate." } },
  { id: "w4-not", hanzi: "不", pinyin: "bù", english: "Not", icon: "🙅", tip: "Use this word to say not. Before another fourth tone, its tone rises.",
    related: [{ hanzi: "不是", pinyin: "bú shì", english: "is not" }, { hanzi: "不好", pinyin: "bù hǎo", english: "not good" }],
    sentence: { hanzi: "这不是我的书。", pinyin: "Zhè bú shì wǒ de shū.", english: "This is not my book." } },
  { id: "w4-female", hanzi: "女", pinyin: "nǚ", english: "Female / daughter", icon: "👧", tip: "This character is in 女儿, daughter, and on the left of 她, she.",
    related: [{ hanzi: "女儿", pinyin: "nǚ'ér", english: "daughter" }, { hanzi: "女生", pinyin: "nǚshēng", english: "female student" }],
    sentence: { hanzi: "她是王老师的女儿。", pinyin: "Tā shì Wáng lǎoshī de nǚ'ér.", english: "She is Teacher Wang's daughter." } },
  { id: "w4-child", hanzi: "儿", pinyin: "ér", english: "Child / son", icon: "🧒", tip: "Find this character in both son and daughter.",
    related: [{ hanzi: "儿子", pinyin: "érzi", english: "son" }, { hanzi: "女儿", pinyin: "nǚ'ér", english: "daughter" }],
    sentence: { hanzi: "他有一个儿子。", pinyin: "Tā yǒu yí ge érzi.", english: "He has a son." } },
];
// Original completed examples of the page 1 writing pattern “I have…”.
export const WEEK_4_SENTENCES: Word[] = [
  { id: "w4-have-brother", hanzi: "我有一个弟弟。", pinyin: "Wǒ yǒu yí ge dìdi.", english: "I have a younger brother.", icon: "👦", tip: "Say a sentence for a pretend family." },
  { id: "w4-have-bag", hanzi: "我有一个书包。", pinyin: "Wǒ yǒu yí ge shūbāo.", english: "I have a schoolbag.", icon: "🎒", tip: "Try saying what you have." },
  { id: "w4-have-fish", hanzi: "我有一条小鱼。", pinyin: "Wǒ yǒu yì tiáo xiǎo yú.", english: "I have a little fish.", icon: "🐟", tip: "Use 条 to count a fish." },
];
// Original practice for the number-line, dice, and word-problem goals on p. 1.
export const WEEK_4_NUMBER_LINE: Word[] = sumCards("w4-line", [[2, 3], [4, 2], [0, 4], [5, 0], [7, 3]]).map(word => ({ ...word, mathModel: "number-line", tip: `Start at ${word.parts![0]}. Hop forward ${word.parts![1]} times.` }));
export const WEEK_4_DICE: Word[] = sumCards("w4-dice", [[1, 2], [2, 2], [3, 4], [6, 1], [4, 6]]).map(word => ({ ...word, mathModel: "dice", tip: "Count the dots on both dice to find the total." }));
export const WEEK_4_STORIES: Word[] = sumCards("w4-story", [[2, 3], [4, 1], [3, 3], [6, 2]]).map((word, index) => ({ ...word, tip: "Find the two groups in the story. Add them together.", story: [
  { en: "Two fish swim by. Three more join them. How many fish are there?", zh: "有两条鱼，又来了三条。一共有几条鱼？" },
  { en: "Four children are playing. One more joins them. How many children are there?", zh: "四个小朋友在玩，又来了一个。一共有几个小朋友？" },
  { en: "There are three apples in a basket. Put in three more. How many apples are there?", zh: "篮子里有三个苹果，再放进三个。一共有几个苹果？" },
  { en: "There are six books on a desk. Add two more. How many books are there?", zh: "桌上有六本书，再放两本。一共有几本书？" },
][index] }));
export const WEEK_4_LESSONS: Lesson[] = [
  { id: "w4-sounds", week: 4, title: "Sound explorers", chinese: "b p m f · d t n l", description: "Eight sounds with your lips and tongue", color: "cyan", icon: "🗣️", words: WEEK_4_INITIALS, kind: "sounds" },
  { id: "w4-reading", week: 4, title: "Read with me", chinese: "你 我 他 她", description: "Twelve characters about you and your family", color: "green", icon: "🏠", words: WEEK_4_READING, kind: "words" },
  { id: "w4-writing", week: 4, title: "Trace with me", chinese: "木 土 八 也 不 女 儿", description: "Seven characters to trace", color: "rose", icon: "✏️", words: WEEK_4_WRITING, kind: "writing" },
  { id: "w4-i-have", week: 4, title: "I have…", chinese: "我有……", description: "Listen, tap, and say a sentence", color: "violet", icon: "🎒", words: WEEK_4_SENTENCES, kind: "sentences" },
  { id: "w4-addition", week: 4, title: "Add & explore", chinese: "十以内加法", description: "Number-line hops, dice, and little stories", color: "amber", icon: "➕", words: [...WEEK_4_NUMBER_LINE, ...WEEK_4_DICE, ...WEEK_4_STORIES], kind: "addition" },
];

// Credit any earned star from the original eleven-island Week 4 layout.
export const WEEK_4_PREVIOUS_LESSONS: Record<string, string[]> = {
  "w4-sounds": ["w4-lip-sounds", "w4-tongue-sounds"],
  "w4-reading": ["w4-you-and-me", "w4-at-home", "w4-my-family"],
  "w4-writing": ["w4-trace-nature", "w4-trace-family"],
  "w4-addition": ["w4-number-line", "w4-dice", "w4-stories"],
};

export const WEEKS = [
  { number: 1, title: "I go to school", dates: "Sep 1–4", lessons: WEEK_1_LESSONS },
  { number: 2, title: "Sounds & new friends", dates: "Sep 8–11", lessons: WEEK_2_LESSONS },
  { number: 3, title: "Family & counting", dates: "Sep 14–18", lessons: WEEK_3_LESSONS },
  { number: 4, title: "New sounds & sums", dates: "Sep 21–25", lessons: WEEK_4_LESSONS },
];
export const LESSONS: Lesson[] = WEEKS.flatMap((week) => week.lessons);
export function practiceSpeech(word: Word): string { return word.audioText ?? word.example?.hanzi ?? word.hanzi; }
