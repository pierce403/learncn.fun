import type { Word } from "./curriculum";

// Actual reading targets, shown and spoken in full. Keep the curriculum character
// and its IDs intact for handwriting, saved history, and week eligibility.
const FAMILY_WORDS: Record<string, { hanzi: string; pinyin: string; english?: string; icon?: string }> = {
  爸: { hanzi: "爸爸", pinyin: "bàba" },
  妈: { hanzi: "妈妈", pinyin: "māma" },
  哥: { hanzi: "哥哥", pinyin: "gēge" },
  姐: { hanzi: "姐姐", pinyin: "jiějie" },
  弟: { hanzi: "弟弟", pinyin: "dìdi" },
  妹: { hanzi: "妹妹", pinyin: "mèimei" },
  爷: { hanzi: "爷爷", pinyin: "yéye" },
  奶: { hanzi: "奶奶", pinyin: "nǎinai", english: "grandma", icon: "👵" },
  叔: { hanzi: "叔叔", pinyin: "shūshu" },
};

export function readingWord(word: Word): Word {
  const form = FAMILY_WORDS[word.hanzi];
  return form ? { ...word, ...form } : word;
}
