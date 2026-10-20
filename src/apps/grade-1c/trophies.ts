import type { Word } from "./curriculum";
import { practicePool, priority, skillFor, type Skill, type WordHistory, type WordResult } from "./practice";

export type TrophyCharacter = {
  word: Word;
  skills: { skill: Skill; result?: WordResult }[];
};

export function trophyCase(history: WordHistory, currentWeek: number) {
  const characters = new Map<string, TrophyCharacter>();
  for (const item of practicePool(currentWeek)) {
    const character = characters.get(item.word.hanzi) ?? { word: item.word, skills: [] };
    character.skills.push({ skill: skillFor(item.lesson), result: history[item.key] });
    characters.set(item.word.hanzi, character);
  }
  const best: TrophyCharacter[] = [], untried: TrophyCharacter[] = [], practice: TrophyCharacter[] = [];
  const results = (character: TrophyCharacter) => character.skills.flatMap(({ result }) => result?.attempts ? [result] : []);
  const need = (character: TrophyCharacter) => Math.max(0, ...results(character).map(priority));
  const streak = (character: TrophyCharacter) => results(character).reduce((sum, result) => sum + result.streak, 0);
  for (const character of characters.values()) {
    const tried = results(character);
    if (!tried.length) untried.push(character);
    else if (tried.some(result => result.difficulty >= .25)) practice.push(character);
    else best.push(character);
  }
  best.sort((a, b) => need(a) - need(b) || streak(b) - streak(a));
  practice.sort((a, b) => need(b) - need(a) || streak(a) - streak(b));
  return { best, untried, practice, total: characters.size };
}
