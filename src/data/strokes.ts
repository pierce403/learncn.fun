import characterStrokes from './character-strokes.json';

export type Stroke = { id: string; name: string; pinyin: string; english: string; path: string };

// Paths are teaching diagrams in a 100×100 square, drawn in writing direction.
// Character sequences and provenance: docs/strokes.md.
export const STROKES: Stroke[] = [
  { id: 'h', name: '横', pinyin: 'héng', english: 'Across', path: 'M18 50 L82 50' },
  { id: 's', name: '竖', pinyin: 'shù', english: 'Down', path: 'M50 18 L50 82' },
  { id: 'p', name: '撇', pinyin: 'piě', english: 'Down left', path: 'M72 20 Q58 57 24 80' },
  { id: 'n', name: '捺', pinyin: 'nà', english: 'Down right', path: 'M25 20 Q43 60 80 80' },
  { id: 'd', name: '点', pinyin: 'diǎn', english: 'Dot', path: 'M40 32 Q53 43 60 62' },
  { id: 't', name: '提', pinyin: 'tí', english: 'Up right', path: 'M25 72 L74 30' },
  { id: 'sg', name: '竖钩', pinyin: 'shù gōu', english: 'Down, hook', path: 'M58 16 L58 76 Q58 88 42 70' },
  { id: 'hz', name: '横折', pinyin: 'héng zhé', english: 'Across, down', path: 'M20 25 L76 25 L76 80' },
  { id: 'hzg', name: '横折钩', pinyin: 'héng zhé gōu', english: 'Across, down, hook', path: 'M18 25 L76 25 L72 74 Q70 90 56 72' },
  { id: 'swg', name: '竖弯钩', pinyin: 'shù wān gōu', english: 'Down, curve, hook', path: 'M28 18 L28 66 Q28 80 42 80 L74 80 Q84 80 80 61' },
  { id: 'pd', name: '撇点', pinyin: 'piě diǎn', english: 'Down left, down right', path: 'M53 18 L26 58 L74 82' },
  { id: 'hp', name: '横撇', pinyin: 'héng piě', english: 'Across, down left', path: 'M20 24 L78 24 Q58 62 24 82' },
  { id: 'hg', name: '横钩', pinyin: 'héng gōu', english: 'Across, hook', path: 'M18 42 L82 42 L70 58' },
  { id: 'sz', name: '竖折', pinyin: 'shù zhé', english: 'Down, across', path: 'M28 18 L28 78 L78 78' },
  { id: 'hzwg', name: '横折弯钩', pinyin: 'héng zhé wān gōu', english: 'Across, down, curve, hook', path: 'M18 24 L56 24 L56 65 Q56 80 78 80 L82 64' },
  { id: 'sw', name: '竖弯', pinyin: 'shù wān', english: 'Down, curve', path: 'M28 18 L28 66 Q28 80 43 80 L78 80' },
  { id: 'pz', name: '撇折', pinyin: 'piě zhé', english: 'Down left, across', path: 'M60 18 L24 76 L78 64' },
  { id: 'wg', name: '弯钩', pinyin: 'wān gōu', english: 'Curve, hook', path: 'M36 18 Q70 44 58 78 L42 67' },
  { id: 'xg', name: '斜钩', pinyin: 'xié gōu', english: 'Slant, hook', path: 'M27 18 Q46 76 76 82 L78 64' },
  { id: 'wog', name: '卧钩', pinyin: 'wò gōu', english: 'Reclining hook', path: 'M18 42 Q35 79 76 72 L77 55' },
  { id: 'hzw', name: '横折弯', pinyin: 'héng zhé wān', english: 'Across, down, curve', path: 'M18 24 L58 24 L58 67 Q58 80 80 80' },
  { id: 'hxg', name: '横斜钩', pinyin: 'héng xié gōu', english: 'Across, slant, hook', path: 'M18 24 L55 24 Q55 80 80 80 L82 63' },
  { id: 'hzt', name: '横折提', pinyin: 'héng zhé tí', english: 'Across, down, up', path: 'M20 24 L52 24 L52 78 L78 55' },
  { id: 'st', name: '竖提', pinyin: 'shù tí', english: 'Down, up right', path: 'M35 18 L35 80 L74 54' },
  { id: 'szz', name: '竖折折', pinyin: 'shù zhé zhé', english: 'Down, across, down left', path: 'M32 18 L22 47 L78 47 L48 80' },
  { id: 'szzg', name: '竖折折钩', pinyin: 'shù zhé zhé gōu', english: 'Down, across, down, hook', path: 'M30 18 L22 46 L78 46 L73 78 L57 68' },
  { id: 'hzzp', name: '横折折撇', pinyin: 'héng zhé zhé piě', english: 'Across, down, across, left', path: 'M18 23 L62 23 L42 45 L78 45 Q58 72 27 83' },
  { id: 'hzzzg', name: '横折折折钩', pinyin: 'héng zhé zhé zhé gōu', english: 'Across, three turns, hook', path: 'M20 20 L57 20 L47 43 L78 43 L72 77 L55 69' },
  { id: 'hpwg', name: '横撇弯钩', pinyin: 'héng piě wān gōu', english: 'Across, left, curve, hook', path: 'M24 20 L74 20 L49 45 Q91 74 51 79 L43 67' },
  { id: 'hzzz', name: '横折折折', pinyin: 'héng zhé zhé zhé', english: 'Across, down, across, down', path: 'M20 20 L62 20 L62 47 L37 47 L37 80' },
];
export const STROKES_BY_ID: Record<string, Stroke> = Object.fromEntries(STROKES.map(stroke => [stroke.id, stroke]));
export const STROKE_SETS = [
  { id: 'basic', title: 'First strokes', ids: ['h', 's', 'p', 'n', 'd', 't'] },
  { id: 'turns', title: 'Turns & hooks', ids: ['sg', 'hz', 'hzg', 'swg', 'pd', 'hp'] },
] as const;

export function getCharacterStroke(hanzi: string, index: number, total?: number): Stroke | null {
  const ids = (characterStrokes as Record<string, string[]>)[hanzi];
  // Never shift labels onto the wrong stroke if the drawing data changes.
  if (!ids || (total !== undefined && ids.length !== total)) return null;
  return STROKES_BY_ID[ids[index]] ?? null;
}
