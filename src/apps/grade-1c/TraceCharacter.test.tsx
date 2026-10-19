// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TraceCharacter from './TraceCharacter';

const fake = vi.hoisted(() => ({ quiz: vi.fn(), cancelQuiz: vi.fn(), highlightStroke: vi.fn(), getCharacterData: vi.fn(async () => ({ strokes: [{}, {}, {}] })) }));
vi.mock('hanzi-writer', () => ({ default: { create: () => fake } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('tracing stroke narration', () => {
  it('names completed strokes, repeats the next name on Show, and preserves the final name for completion', async () => {
    const speak = vi.fn(); const complete = vi.fn(); const help = vi.fn();
    await act(async () => { render(<TraceCharacter hanzi="口" onStrokeName={speak} onComplete={complete} onHelp={help} onFallback={vi.fn()} />); });
    const quiz = fake.quiz.mock.calls.at(-1)![0];
    act(() => quiz.onCorrectStroke({ strokeNum: 0, strokesRemaining: 2 }));
    expect(speak).toHaveBeenLastCalledWith('竖');
    fireEvent.click(screen.getByRole('button', { name: 'Show the next stroke' }));
    expect(speak).toHaveBeenLastCalledWith('横折');
    expect(fake.highlightStroke).toHaveBeenLastCalledWith(1);
    act(() => quiz.onCorrectStroke({ strokeNum: 1, strokesRemaining: 1 }));
    expect(speak).toHaveBeenLastCalledWith('横折');
    act(() => { quiz.onCorrectStroke({ strokeNum: 2, strokesRemaining: 0 }); quiz.onComplete(); });
    expect(complete).toHaveBeenCalledWith('横');
    expect(screen.getByText('You wrote it!')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Show the next stroke' }) as HTMLButtonElement).disabled).toBe(true);
  });
  it('ignores stale writer events after leaving the activity', async () => {
    const speak = vi.fn(); const complete = vi.fn();
    let unmount!: () => void;
    await act(async () => { ({ unmount } = render(<TraceCharacter hanzi="口" onStrokeName={speak} onComplete={complete} onHelp={vi.fn()} onFallback={vi.fn()} />)); });
    const quiz = fake.quiz.mock.calls.at(-1)![0];
    unmount();
    act(() => { quiz.onCorrectStroke({ strokeNum: 0, strokesRemaining: 2 }); quiz.onComplete(); });
    expect(speak).not.toHaveBeenCalled(); expect(complete).not.toHaveBeenCalled();
    expect(fake.cancelQuiz).toHaveBeenCalled();
  });
});
