// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PwaInstallPrompt, PwaInstallProvider, INSTALL_DISMISSED_KEY, INSTALL_SNOOZE_MS } from './PwaInstall';

function App({ home = true }: { home?: boolean }) {
  return <PwaInstallProvider>{home ? <PwaInstallPrompt /> : <p>Writing lesson</p>}</PwaInstallProvider>;
}
function installEvent(outcome: 'accepted' | 'dismissed' = 'accepted') {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  const prompt = vi.fn(async () => undefined);
  Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome }) });
  act(() => { window.dispatchEvent(event); });
  return { event, prompt };
}

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches:false, addEventListener:vi.fn(), removeEventListener:vi.fn() })));
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Chrome Android');
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('PWA installation promotion', () => {
  it('waits for browser eligibility and a user tap, then consumes the event only once', async () => {
    render(<App />);
    expect(screen.queryByRole('complementary')).toBeNull();
    const { event, prompt } = installEvent();
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    const button = screen.getByRole('button', { name:'Install app' });
    await act(async () => { fireEvent.click(button); fireEvent.click(button); });
    expect(prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole('complementary')).toBeNull();
  });
  it('retains eligibility through an active lesson without interrupting it', () => {
    const view = render(<App home={false} />);
    installEvent();
    expect(screen.queryByRole('complementary')).toBeNull();
    view.rerender(<App />);
    expect(screen.getByRole('button', { name:'Install app' })).toBeTruthy();
  });
  it('remembers Not now for seven days across pages and allows a later reminder', () => {
    const view = render(<App />);
    installEvent();
    fireEvent.click(screen.getByRole('button', { name:'Not now' }));
    const until = Number(localStorage.getItem(INSTALL_DISMISSED_KEY));
    expect(until).toBeGreaterThan(Date.now() + INSTALL_SNOOZE_MS - 1000);
    view.unmount();
    const second = render(<App />);
    installEvent();
    expect(screen.queryByRole('complementary')).toBeNull();
    second.unmount();
    localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now() - 1));
    render(<App />); installEvent();
    expect(screen.getByRole('button', { name:'Install app' })).toBeTruthy();
  });
  it('snoozes a native dismissal and handles appinstalled from the browser menu', async () => {
    const view = render(<App />);
    installEvent('dismissed');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name:'Install app' })); });
    expect(Number(localStorage.getItem(INSTALL_DISMISSED_KEY))).toBeGreaterThan(Date.now());
    view.unmount(); localStorage.clear();
    render(<App />); installEvent();
    act(() => { window.dispatchEvent(new Event('appinstalled')); });
    expect(screen.queryByRole('complementary')).toBeNull();
  });
  it('shows iPhone/iPad instructions without a fake native install button', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone Safari');
    render(<App />);
    expect(screen.queryByRole('button', { name:'Install app' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name:'How to install' }));
    expect(screen.getByText('Add to Home Screen')).toBeTruthy();
    expect(screen.getByText('Open as Web App')).toBeTruthy();
  });
  it('hides when running standalone, including iOS standalone mode', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('iPhone Safari');
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches:true, addEventListener:vi.fn(), removeEventListener:vi.fn() })));
    render(<App />); installEvent();
    expect(screen.queryByRole('complementary')).toBeNull();
  });
  it('handles rejected prompts and unavailable storage without breaking lessons', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('blocked'); });
    render(<App />);
    const { prompt } = installEvent();
    prompt.mockRejectedValueOnce(Error('not allowed'));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name:'Install app' })); });
    expect(screen.getByRole('status').textContent).toContain('Installation couldn’t open');
    expect(screen.queryByRole('button', { name:'Install app' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name:'Not now' }));
    expect(screen.queryByRole('complementary')).toBeNull();
  });
});
