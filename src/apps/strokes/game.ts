import { STROKES_BY_ID, STROKE_SETS, type Stroke } from '../../data/strokes';
import { shuffleInPlace } from '../../lib/random';

export function makeStrokeRound(setIndex: number): Stroke[] {
  const ids = [...STROKE_SETS[setIndex].ids];
  shuffleInPlace(ids);
  return ids.map(id => STROKES_BY_ID[id]);
}
