import { describe, expect, it } from 'vitest';
import { LEVEL_CHARACTER_SEEDS } from '../../data/level-character-seeds';
import { LESSONS } from '../grade-1c/curriculum';
import characterStrokes from '../../data/character-strokes.json';
import { getCharacterStroke, STROKES_BY_ID, STROKE_SETS } from '../../data/strokes';
import { makeStrokeRound } from './game';

const names = (hanzi: string) => (characterStrokes as Record<string, string[]>)[hanzi].map(id => STROKES_BY_ID[id].name);
describe('stroke learning content', () => {
  it('names every stroke for all book characters and penguin tracing lessons', () => {
    const characters = [...Object.values(LEVEL_CHARACTER_SEEDS).flat().map(word => word.hanzi), ...LESSONS.filter(lesson => lesson.kind === 'writing').flatMap(lesson => lesson.words.map(word => word.hanzi))];
    for (const character of characters) {
      const ids = (characterStrokes as Record<string, string[]>)[character];
      expect(ids, character).toBeDefined();
      for (const id of ids) expect(STROKES_BY_ID[id], `${character}: ${id}`).toBeDefined();
    }
  });
  it('keeps compound strokes whole and matches the taught writing sequences', () => {
    expect(names('五')).toEqual(['横', '竖', '横折', '横']);
    expect(names('口')).toEqual(['竖', '横折', '横']);
    expect(names('也')).toEqual(['横折钩', '竖', '竖弯钩']);
    expect(names('山')).toEqual(['竖', '竖折', '竖']);
    expect(names('母')[0]).toBe('竖折');
    expect(names('九')[1]).toBe('横折弯钩');
    expect(names('女')).toEqual(['撇点', '撇', '横']);
    expect(names('木')).toEqual(['横', '竖', '撇', '捺']);
    expect(names('字')).toEqual(['点', '点', '横钩', '横撇', '竖钩', '横']);
    expect(names('安')[2]).toBe('横钩');
    expect(names('心')[1]).toBe('卧钩');
    expect(names('阳')[0]).toBe('横撇弯钩');
  });
  it('does not invent a name for unknown data, out-of-bounds strokes, or mismatched drawing counts', () => {
    expect(getCharacterStroke('龘', 0)).toBeNull();
    expect(getCharacterStroke('口', 1, 4)).toBeNull();
    expect(getCharacterStroke('口', 3, 3)).toBeNull();
    expect(getCharacterStroke('口', 1, 3)?.name).toBe('横折');
  });
  it('covers every stroke exactly once with three distinct solvable choices', () => {
    for (let set = 0; set < STROKE_SETS.length; set++) for (let run = 0; run < 20; run++) {
      const round = makeStrokeRound(set);
      expect(round.map(item => item.stroke.id).sort()).toEqual([...STROKE_SETS[set].ids].sort());
      for (const item of round) {
        expect(new Set(item.options.map(option => option.id)).size).toBe(3);
        expect(item.options.filter(option => option.id === item.stroke.id)).toHaveLength(1);
      }
    }
  });
});
