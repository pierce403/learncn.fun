// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WriteApp from './WriteApp';
import { speakChineseSequence, stopSpeech } from '../../lib/speech';

const fake = vi.hoisted(() => ({ quiz: vi.fn(), cancelQuiz: vi.fn(), highlightStroke: vi.fn(), showOutline: vi.fn(), getCharacterData: vi.fn(async () => ({ strokes: [{}, {}, {}] })) }));
const selection = vi.hoisted(() => ({ hanzi: '口' }));
vi.mock('hanzi-writer', () => ({ default: { create: () => fake } }));
vi.mock('../../data/words', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../data/words')>();
  return { ...actual, getWriteWordsForLevel: () => actual.WORDS.filter(word => word.hanzi === selection.hanzi) };
});
vi.mock('../../components/LevelSelector', () => ({ LevelSelector: () => null }));
vi.mock('../../hooks/useVocabularySelection', () => ({ useVocabularySelection: () => ({ level:1, scope:'all', setLevel:vi.fn(), setScope:vi.fn() }) }));
vi.mock('../../lib/speech', () => ({ stopSpeech:vi.fn(), speakChineseSequence:vi.fn(async () => {}) }));
vi.mock('../../lib/sfx', () => ({ playDing:vi.fn(), playPop:vi.fn(), playTada:vi.fn() }));

beforeEach(() => {
  selection.hanzi = '口';
  localStorage.clear();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width:280, height:280 } as DOMRect);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); vi.restoreAllMocks(); });

describe('Write stroke speech', () => {
  it('speaks 了 directly when opening and replaying its writing prompt', async () => {
    selection.hanzi = '了';
    await act(async () => { render(<WriteApp />); });
    expect(speakChineseSequence).toHaveBeenLastCalledWith(['这个字怎么写？', '了'], { rate:.95 });
    vi.mocked(speakChineseSequence).mockClear();
    fireEvent.click(screen.getByRole('button', { name:'Play audio' }));
    expect(speakChineseSequence).toHaveBeenCalledExactlyOnceWith(['这个字怎么写？', '了'], { rate:.95 });
  });
  it('speaks accepted and hinted names and queues the final name before the character', async () => {
    await act(async () => { render(<WriteApp />); });
    const quiz = fake.quiz.mock.calls.at(-1)![0];
    act(() => quiz.onCorrectStroke({ strokeNum:0, strokesRemaining:2 }));
    expect(speakChineseSequence).toHaveBeenLastCalledWith(['竖'], { rate:.85 });
    fireEvent.click(screen.getByRole('button', { name:'Hint stroke' }));
    expect(speakChineseSequence).toHaveBeenLastCalledWith(['横折'], { rate:.85 });
    act(() => { quiz.onCorrectStroke({ strokeNum:2, strokesRemaining:0 }); quiz.onComplete({ totalMistakes:0 }); });
    expect(speakChineseSequence).toHaveBeenLastCalledWith(['横', '口'], { rate:.85 });
  });
  it('stops current audio immediately when muted and keeps subsequent strokes silent', async () => {
    await act(async () => { render(<WriteApp />); });
    const quiz = fake.quiz.mock.calls.at(-1)![0];
    vi.mocked(stopSpeech).mockClear();
    fireEvent.click(screen.getByRole('button', { name:'Audio On' }));
    expect(stopSpeech).toHaveBeenCalledOnce();
    vi.mocked(speakChineseSequence).mockClear();
    act(() => quiz.onCorrectStroke({ strokeNum:0, strokesRemaining:2 }));
    fireEvent.click(screen.getByRole('button', { name:'Hint stroke' }));
    expect(speakChineseSequence).not.toHaveBeenCalled();
    expect(screen.getByText('横折')).toBeTruthy();
  });
});
