export type Point = { x: number; y: number };
export type DrawingResult = 'correct' | 'start' | 'short' | 'shape';

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const mix = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const length = (points: Point[]) => points.slice(1).reduce((sum, point, i) => sum + distance(points[i], point), 0);

// The authored teaching diagrams use absolute M, L and Q commands. Sampling
// them here keeps grading independent of browser SVG APIs and screen size.
export function strokePoints(path: string): Point[] {
  const tokens = path.match(/[MLQ]|-?\d+(?:\.\d+)?/g) ?? [];
  const points: Point[] = [];
  let i = 0;
  const read = (): Point => ({ x: Number(tokens[i++]), y: Number(tokens[i++]) });
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === 'M') points.push(read());
    else if (command === 'L') points.push(read());
    else if (command === 'Q') {
      const start = points[points.length - 1];
      const control = read();
      const end = read();
      for (let step = 1; step <= 24; step++) {
        const t = step / 24;
        points.push(mix(mix(start, control, t), mix(control, end, t), t));
      }
    } else throw new Error(`Unsupported teaching path command: ${command}`);
  }
  return points;
}

function resample(points: Point[], count = 80): Point[] {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
  const total = cumulative[cumulative.length - 1];
  if (!total) return [points[0]];
  let segment = 1;
  return Array.from({ length: count }, (_, i) => {
    const position = total * i / (count - 1);
    while (segment < points.length - 1 && cumulative[segment] < position) segment++;
    const span = cumulative[segment] - cumulative[segment - 1];
    return mix(points[segment - 1], points[segment], span ? (position - cumulative[segment - 1]) / span : 0);
  });
}

export function gradeStroke(drawn: Point[], target: Point[]): DrawingResult {
  if (!drawn.length || drawn.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return 'short';
  if (distance(drawn[0], target[0]) > 11) return 'start';
  const expectedLength = length(target);
  const drawnLength = length(drawn);
  if (drawnLength < expectedLength * .65) return 'short';
  // Allow small, frequent wobbles (especially on the short dot stroke). Large
  // reversals still fail the ordered comparison below.
  if (drawnLength > expectedLength * 2.8 || distance(drawn[drawn.length - 1], target[target.length - 1]) > 10) return 'shape';

  // Discrete Fréchet distance: both curves must move forward together. Unlike
  // nearest-point distance, this rejects reverse strokes and large backtracks.
  // 10 units of tolerance in the 100-unit pad leave room for young writers.
  const a = resample(drawn);
  const b = resample(target);
  let previous = Array<number>(b.length).fill(Infinity);
  for (let i = 0; i < a.length; i++) {
    const row = Array<number>(b.length).fill(Infinity);
    for (let j = 0; j < b.length; j++) {
      const before = i === 0 && j === 0 ? 0 : Math.min(previous[j], j ? previous[j - 1] : Infinity, j ? row[j - 1] : Infinity);
      row[j] = Math.max(distance(a[i], b[j]), before);
    }
    previous = row;
  }
  return previous[b.length - 1] <= 10 ? 'correct' : 'shape';
}
