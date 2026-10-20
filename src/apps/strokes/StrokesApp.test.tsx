// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StrokesApp from './StrokesApp';
import { STROKES } from '../../data/strokes';
import { strokePoints, type Point } from './drawing';

vi.mock('../../lib/speech', () => ({ isSpeechSupported: () => true, stopSpeech: vi.fn(), speakBilingualSequence: vi.fn(async () => {}) }));
vi.mock('../../lib/sfx', () => ({ playDing: vi.fn(), playPop: vi.fn(), playTada: vi.fn() }));
vi.mock('../../lib/confetti', () => ({ burstConfetti: vi.fn() }));
vi.mock('../../lib/random', () => ({ shuffleInPlace: vi.fn() }));

beforeEach(() => {
  // Exercise real pointer handlers on a scaled pad; jsdom lacks pointer/layout APIs.
  vi.stubGlobal('PointerEvent', class extends MouseEvent {
    pointerId: number; pointerType: string; isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init); this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? 'touch'; this.isPrimary = init.isPrimary ?? true;
    }
  });
  vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({ x: 20, y: 30, left: 20, top: 30, width: 300, height: 300, right: 320, bottom: 330, toJSON() {} });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const pad = () => screen.getByRole('img', { name: /^Drawing area/ });
const event = (point: Point, pointerId = 1, pointerType = 'touch') => ({ clientX: 20 + point.x * 3, clientY: 30 + point.y * 3, pointerId, pointerType, button: 0 });
function draw(points: Point[], pointerType = 'touch') {
  const canvas = pad();
  fireEvent.pointerDown(canvas, event(points[0], 1, pointerType));
  for (const point of points.slice(1)) fireEvent.pointerMove(canvas, event(point, 1, pointerType));
  fireEvent.pointerUp(canvas, event(points[points.length - 1], 1, pointerType));
}

describe('stroke drawing playground', () => {
  it('draws a full round, retries, awards once, and resets on replay', () => {
    render(<StrokesApp onHome={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play now' }));
    expect(screen.getByRole('heading').textContent).toBe('Draw the stroke');
    expect(screen.queryByRole('group', { name: 'Stroke shapes' })).toBeNull();
    for (let question = 0; question < 6; question++) {
      const name = screen.getByRole('button', { name: /^Hear / }).getAttribute('aria-label')!.slice(5);
      const stroke = STROKES.find(item => item.name === name)!;
      const points = strokePoints(stroke.path);
      if (question === 0) {
        draw([...points].reverse());
        expect(screen.getByRole('status').textContent).toBe('Start at the gold dot.');
        expect(screen.queryByRole('button', { name: 'Next →' })).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: '↻ Watch again' }));
        expect(pad().querySelector('.stroke-user-ink')).toBeNull();
        expect(pad().querySelector('.stroke-demo')).toBeTruthy();
      }
      draw(points, question % 2 ? 'mouse' : 'touch');
      draw(points); // A completed pad must not award twice.
      expect(screen.getByRole('status').textContent).toContain(`You drew ${stroke.name}`);
      expect(screen.getByRole('progressbar').getAttribute('value')).toBe(String(question + 1));
      fireEvent.click(screen.getByRole('button', { name: question === 5 ? 'Finish ★' : 'Next →' }));
    }
    expect(screen.getByText('You drew all 6 strokes.')).toBeTruthy();
    expect(screen.getByText('5 on the first try!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('0');
    expect(pad().querySelector('.stroke-user-ink')).toBeNull();
  });

  it('ignores another finger, cancels interrupted input, and clears a retry', () => {
    render(<StrokesApp onHome={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play now' }));
    fireEvent.pointerDown(pad(), event({ x: 18, y: 50 }));
    fireEvent.pointerDown(pad(), { ...event({ x: 90, y: 90 }, 2), isPrimary: false });
    fireEvent.pointerMove(pad(), event({ x: 90, y: 90 }, 2));
    fireEvent.pointerUp(pad(), event({ x: 90, y: 90 }, 2));
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('0');
    fireEvent.pointerCancel(pad(), event({ x: 18, y: 50 }));
    expect(pad().querySelector('.stroke-user-ink')).toBeNull();
    draw([{ x: 18, y: 50 }, { x: 30, y: 50 }]);
    expect(screen.getByRole('status').textContent).toContain('Keep going');
    fireEvent.click(screen.getByRole('button', { name: 'Clear drawing' }));
    expect(pad().querySelector('.stroke-user-ink')).toBeNull();
    draw([{ x: 18, y: 50 }, { x: 82, y: 50 }], 'pen');
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('1');
  });

  it('keeps hooks in one gesture, works silently, switches sets, and returns home', () => {
    const onHome = vi.fn();
    render(<StrokesApp onHome={onHome} homeLabel="Map" initialAudio={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Turns & hooks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Play now' }));
    expect((screen.getByRole('button', { name: /^Hear / }) as HTMLButtonElement).disabled).toBe(true);
    draw([{ x: 58, y: 16 }, { x: 58, y: 76 }]);
    expect(screen.queryByRole('button', { name: 'Next →' })).toBeNull();
    draw(strokePoints(STROKES.find(stroke => stroke.id === 'sg')!.path), 'pen');
    expect(screen.getByRole('button', { name: 'Next →' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'First strokes' }));
    expect(screen.getByRole('heading').textContent).toBe('Meet the strokes');
    fireEvent.click(screen.getByRole('button', { name: '← Map' }));
    expect(onHome).toHaveBeenCalledOnce();
  });
});
