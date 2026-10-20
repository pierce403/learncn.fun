import { describe, expect, it } from 'vitest';
import { STROKES, STROKES_BY_ID } from '../../data/strokes';
import { gradeStroke, strokePoints, type Point } from './drawing';

const target = (id: string) => strokePoints(STROKES_BY_ID[id].path);

describe('stroke drawing recognition', () => {
  it('accepts every teaching path with child-sized wobble and rejects reversed strokes', () => {
    for (const stroke of STROKES) {
      const points = strokePoints(stroke.path);
      expect(gradeStroke(points, points), stroke.name).toBe('correct');
      const wobbly = points.map((point, i) => ({ x: point.x + Math.sin(i) * 3, y: point.y + Math.cos(i) * 3 }));
      expect(gradeStroke(wobbly, points), stroke.name).toBe('correct');
      expect(gradeStroke([...points].reverse(), points), stroke.name).not.toBe('correct');
    }
  });
  it('requires a drawn stroke, the starting dot, and the whole length', () => {
    const line = target('h');
    expect(gradeStroke([], line)).toBe('short');
    expect(gradeStroke([line[0], line[0]], line)).toBe('short');
    expect(gradeStroke([{ x: 18, y: 50 }, { x: 40, y: 50 }], line)).toBe('short');
    expect(gradeStroke([{ x: 40, y: 50 }, { x: 82, y: 50 }], line)).toBe('start');
    expect(gradeStroke([{ x: NaN, y: 50 }], line)).toBe('short');
  });
  it('rejects shortcuts through corners, missing hooks, and the wrong shape', () => {
    for (const id of ['hz', 'hzg', 'sg', 'swg', 'pd', 'hp']) {
      const points = target(id);
      expect(gradeStroke([points[0], points[points.length - 1]], points), id).not.toBe('correct');
    }
    expect(gradeStroke([{ x: 58, y: 16 }, { x: 58, y: 76 }], target('sg'))).not.toBe('correct');
    expect(gradeStroke(target('s'), target('h'))).not.toBe('correct');
  });
  it('rejects large reversals and scribbles even when they end in the right place', () => {
    const backtrack: Point[] = [{ x: 18, y: 50 }, { x: 70, y: 50 }, { x: 45, y: 50 }, { x: 82, y: 50 }];
    expect(gradeStroke(backtrack, target('h'))).toBe('shape');
    const scribble = [{ x: 18, y: 50 }, ...Array.from({ length: 20 }, (_, i) => ({ x: 50, y: i % 2 ? 95 : 5 })), { x: 82, y: 50 }];
    expect(gradeStroke(scribble, target('h'))).toBe('shape');
  });
});
