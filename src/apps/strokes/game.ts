import { STROKES_BY_ID, STROKE_SETS, type Stroke } from '../../data/strokes';
import { shuffleInPlace } from '../../lib/random';

export type StrokeQuestion = { stroke: Stroke; options: Stroke[] };
export function makeStrokeRound(setIndex: number): StrokeQuestion[] {
  const ids = [...STROKE_SETS[setIndex].ids];
  shuffleInPlace(ids);
  return ids.map(id => {
    const others = STROKE_SETS[setIndex].ids.filter(other => other !== id);
    shuffleInPlace(others);
    const options = [id, ...others.slice(0, 2)].map(option => STROKES_BY_ID[option]);
    shuffleInPlace(options);
    return { stroke: STROKES_BY_ID[id], options };
  });
}
