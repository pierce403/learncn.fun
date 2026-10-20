// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TraceCharacter from './TraceCharacter';

const fake = vi.hoisted(() => ({ create: vi.fn(), quiz: vi.fn(), cancelQuiz: vi.fn(), highlightStroke: vi.fn(), showOutline: vi.fn(), getCharacterData: vi.fn(async () => ({ strokes: [{}, {}, {}] })) }));
vi.mock('hanzi-writer', () => ({ default: { create: (...args: unknown[]) => { fake.create(...args); return fake; } } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const props = () => ({ hanzi: '口', onStrokeName: vi.fn(), onComplete: vi.fn(), onHelp: vi.fn() });

describe('handwriting attempts', () => {
  it('names guided strokes but never treats tracing as an unassisted pass', async () => {
    const callbacks = props();
    await act(async () => { render(<TraceCharacter {...callbacks} mode="guided" />); });
    expect(fake.create.mock.calls.at(-1)![2].showOutline).toBe(true);
    const quiz = fake.quiz.mock.calls.at(-1)![0];
    act(() => quiz.onCorrectStroke({ strokeNum: 0, strokesRemaining: 2 }));
    expect(callbacks.onStrokeName).toHaveBeenLastCalledWith('竖');
    fireEvent.click(screen.getByRole('button', { name: 'Show the next stroke' }));
    expect(callbacks.onStrokeName).toHaveBeenLastCalledWith('横折');
    expect(fake.highlightStroke).toHaveBeenLastCalledWith(1);
    act(() => { quiz.onCorrectStroke({ strokeNum: 2, strokesRemaining: 0 }); quiz.onComplete({ totalMistakes: 0 }); });
    expect(callbacks.onComplete).toHaveBeenCalledWith({ assisted: true, lastStrokeName: '横' });
    expect(screen.getByText('Ready to try on your own.')).toBeTruthy();
  });
  it('keeps memory checks blank and gives no next-stroke hints on a clean attempt', async () => {
    const callbacks = props();
    await act(async () => { render(<TraceCharacter {...callbacks} mode="recall" />); });
    expect(fake.create.mock.calls.at(-1)![2].showOutline).toBe(false);
    expect(fake.highlightStroke).not.toHaveBeenCalled();
    const quiz = fake.quiz.mock.calls.at(-1)![0];
    act(() => quiz.onCorrectStroke({ strokeNum: 0, strokesRemaining: 2 }));
    expect(fake.highlightStroke).not.toHaveBeenCalled();
    act(() => quiz.onComplete({ totalMistakes: 0 }));
    expect(callbacks.onComplete).toHaveBeenCalledWith({ assisted: false, lastStrokeName: '横' });
    expect(screen.getByText('You wrote it on your own!')).toBeTruthy();
    act(() => quiz.onComplete({ totalMistakes: 0 }));
    expect(callbacks.onComplete).toHaveBeenCalledTimes(1);
  });
  it.each(['mistake', 'hint'])('restores guidance after a %s and requires another full attempt', async (kind) => {
    const callbacks = props();
    await act(async () => { render(<TraceCharacter {...callbacks} mode="recall" />); });
    const quiz = fake.quiz.mock.calls.at(-1)![0];
    if (kind === 'mistake') act(() => quiz.onMistake());
    else fireEvent.click(screen.getByRole('button', { name: 'Show the next stroke' }));
    expect(callbacks.onHelp).toHaveBeenCalledWith(kind === 'mistake' ? 'miss' : 'hint');
    expect(fake.showOutline).toHaveBeenCalled();
    act(() => { quiz.onCorrectStroke({ strokeNum: 1, strokesRemaining: 1 }); quiz.onComplete({ totalMistakes: kind === 'mistake' ? 1 : 0 }); });
    expect(fake.highlightStroke).toHaveBeenLastCalledWith(2);
    expect(callbacks.onComplete).toHaveBeenCalledWith({ assisted: true, lastStrokeName: '横' });
    expect(screen.getByText('Now try the whole character without hints.')).toBeTruthy();
  });
  it('does not allow a reported mistake to pass even if its earlier callback was missed', async () => {
    const callbacks = props();
    await act(async () => { render(<TraceCharacter {...callbacks} mode="recall" />); });
    act(() => fake.quiz.mock.calls.at(-1)![0].onComplete({ totalMistakes: 1 }));
    expect(callbacks.onComplete).toHaveBeenCalledWith({ assisted: true, lastStrokeName: '横' });
  });
  it('retries failed loads without a tap answer or a completion', async () => {
    fake.getCharacterData.mockRejectedValueOnce(new Error('offline'));
    const callbacks = props();
    await act(async () => { render(<TraceCharacter {...callbacks} mode="recall" />); });
    expect(screen.queryByRole('button', { name: /Tap/ })).toBeNull();
    expect(callbacks.onComplete).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Retry drawing pad' })); });
    expect(fake.create).toHaveBeenCalledTimes(2);
    expect(fake.create.mock.calls.at(-1)![2].showOutline).toBe(false);
    expect(callbacks.onComplete).not.toHaveBeenCalled();
  });
  it('ignores stale writer events after leaving the activity', async () => {
    const callbacks = props(); let unmount!: () => void;
    await act(async () => { ({ unmount } = render(<TraceCharacter {...callbacks} mode="recall" />)); });
    const quiz = fake.quiz.mock.calls.at(-1)![0]; unmount();
    act(() => { quiz.onCorrectStroke({ strokeNum: 0, strokesRemaining: 2 }); quiz.onComplete({ totalMistakes: 0 }); });
    expect(callbacks.onStrokeName).not.toHaveBeenCalled(); expect(callbacks.onComplete).not.toHaveBeenCalled();
    expect(fake.cancelQuiz).toHaveBeenCalled();
  });
});
