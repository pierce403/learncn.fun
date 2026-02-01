export type Word = {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
};

export const WORDS: Word[] = [
  { id: "xi-west", hanzi: "西", pinyin: "xī", english: "west" },
  { id: "jia-home", hanzi: "家", pinyin: "jiā", english: "home" },
  { id: "wo-i", hanzi: "我", pinyin: "wǒ", english: "I" },
  { id: "de-of", hanzi: "的", pinyin: "de", english: "of / 's" },
  { id: "nv-woman", hanzi: "女", pinyin: "nǚ", english: "woman" },
  { id: "kou-mouth", hanzi: "口", pinyin: "kǒu", english: "mouth" },
  { id: "qu-go", hanzi: "去", pinyin: "qù", english: "go" },
  { id: "zi-child", hanzi: "子", pinyin: "zǐ", english: "child (depends on context)" },
  { id: "zhi-only", hanzi: "只", pinyin: "zhǐ", english: "only / measure word" },
  { id: "chang-long", hanzi: "长", pinyin: "cháng", english: "long" },
  { id: "fang-square", hanzi: "方", pinyin: "fāng", english: "square" },
  { id: "zai-at", hanzi: "在", pinyin: "zài", english: "at" },
  { id: "le-already", hanzi: "了", pinyin: "le", english: "already" },
  { id: "dong-east", hanzi: "东", pinyin: "dōng", english: "east" },
  { id: "nan-south", hanzi: "南", pinyin: "nán", english: "south" },
  { id: "bei-north", hanzi: "北", pinyin: "běi", english: "north" },
  { id: "bao-treasure", hanzi: "宝", pinyin: "bǎo", english: "treasure" },
  { id: "shui-water", hanzi: "水", pinyin: "shuǐ", english: "water" },
  { id: "zuo-left", hanzi: "左", pinyin: "zuǒ", english: "left" },
  { id: "you-right", hanzi: "右", pinyin: "yòu", english: "right" },
  { id: "niao-bird", hanzi: "鸟", pinyin: "niǎo", english: "bird" },
  { id: "shou-hand", hanzi: "手", pinyin: "shǒu", english: "hand" },
  { id: "tian-sky", hanzi: "天", pinyin: "tiān", english: "sky" },
  { id: "xing-shape", hanzi: "形", pinyin: "xíng", english: "shape" },
  { id: "fang-house", hanzi: "房", pinyin: "fáng", english: "house" },
  { id: "wen-writing", hanzi: "文", pinyin: "wén", english: "writing (depends on context)" },
  { id: "dong-winter", hanzi: "冬", pinyin: "dōng", english: "winter" }
];
