// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import StrokesApp from './StrokesApp';
import { STROKES } from '../../data/strokes';

vi.mock('../../lib/speech', () => ({ isSpeechSupported: () => true, stopSpeech: vi.fn(), speakBilingualSequence: vi.fn(async () => {}) }));
vi.mock('../../lib/sfx', () => ({ playDing: vi.fn(), playPop: vi.fn(), playTada: vi.fn() }));
vi.mock('../../lib/confetti', () => ({ burstConfetti: vi.fn() }));
afterEach(cleanup);

describe('stroke playground', () => {
  it('teaches, retries, finishes a full round, and resets on replay', () => {
    render(<StrokesApp onHome={vi.fn()} />);
    expect(screen.getByRole('heading').textContent).toBe('Meet the strokes');
    fireEvent.click(screen.getByRole('button', { name: 'Play now' }));
    for (let question = 0; question < 6; question++) {
      const name = screen.getByRole('button', { name: /^Hear / }).getAttribute('aria-label')!.slice(5);
      const stroke = STROKES.find(item => item.name === name)!;
      const choices = screen.getAllByRole('button', { name: /^Shape / });
      const correct = choices.find(button => button.getAttribute('aria-label')!.endsWith(`: ${stroke.english}`))!;
      if (question === 0) {
        const wrong = choices.find(button => button !== correct)!;
        fireEvent.click(wrong);
        expect((wrong as HTMLButtonElement).disabled).toBe(true);
        expect(screen.getByRole('status').textContent).toContain('Pick another');
      }
      fireEvent.click(correct);
      fireEvent.click(correct); // Disabled: must not double-count.
      expect(screen.getByRole('status').textContent).toContain(stroke.name);
      fireEvent.click(screen.getByRole('button', { name: question === 5 ? 'Finish ★' : 'Next →' }));
    }
    expect(screen.getByRole('heading').textContent).toBe('You know your strokes!');
    expect(screen.getByText('5 on the first try!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Play again' }));
    expect(screen.getByRole('progressbar').getAttribute('value')).toBe('0');
    expect(screen.queryByRole('button', { name: 'Next →' })).toBeNull();
  });
  it('works with sound off, switches sets, and returns to its caller', () => {
    const onHome = vi.fn();
    render(<StrokesApp onHome={onHome} homeLabel="Map" initialAudio={false} />);
    expect(screen.getByRole('button', { name: 'Sound off' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Turns & hooks' }));
    expect(screen.getByText('shù gōu')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Play now' }));
    expect((screen.getByRole('button', { name: /^Hear / }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getAllByRole('button', { name: /^Shape / })).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: '← Map' }));
    expect(onHome).toHaveBeenCalledOnce();
  });
});
