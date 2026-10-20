import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import './pwa-install.css';

export const INSTALL_DISMISSED_KEY = 'learncn.install.dismissedUntil';
export const INSTALL_SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;
type InstallPromptEvent = Event & {
  prompt: () => Promise<unknown>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};
type InstallState = {
  visible: boolean; ios: boolean; canInstall: boolean; installing: boolean;
  error: string; install: () => Promise<void>; dismiss: () => void;
};
const InstallContext = createContext<InstallState | null>(null);

function isStandalone(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function dismissedUntil(): number {
  try { return Number(localStorage.getItem(INSTALL_DISMISSED_KEY)) || 0; }
  catch { return 0; }
}

// Mounted above each app: preserve a browser install event while a lesson is
// open, then offer it when the learner returns to the home screen.
export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [installed, setInstalled] = useState(isStandalone);
  const [ios] = useState(isIOS);
  const [snoozedUntil, setSnoozedUntil] = useState(dismissedUntil);
  const [canInstall, setCanInstall] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState('');
  const deferred = useRef<InstallPromptEvent | null>(null);
  const busy = useRef(false);

  function dismiss() {
    const until = Date.now() + INSTALL_SNOOZE_MS;
    setSnoozedUntil(until);
    setError('');
    try { localStorage.setItem(INSTALL_DISMISSED_KEY, String(until)); }
    catch { /* The current visit still remembers the dismissal. */ }
  }

  useEffect(() => {
    function beforeInstall(event: Event) {
      const candidate = event as InstallPromptEvent;
      if (typeof candidate.prompt !== 'function') return;
      event.preventDefault();
      deferred.current = candidate;
      setCanInstall(true);
      setError('');
      setInstalled(isStandalone());
    }
    function appInstalled() {
      deferred.current = null;
      setCanInstall(false);
      setInstalled(true);
      setError('');
    }
    function displayChanged() { if (isStandalone()) appInstalled(); }
    function storageChanged(event: StorageEvent) {
      if (event.key === INSTALL_DISMISSED_KEY || event.key === null) setSnoozedUntil(dismissedUntil());
    }
    const display = window.matchMedia?.('(display-mode: standalone)');
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', appInstalled);
    window.addEventListener('storage', storageChanged);
    display?.addEventListener?.('change', displayChanged);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', appInstalled);
      window.removeEventListener('storage', storageChanged);
      display?.removeEventListener?.('change', displayChanged);
    };
  }, []);

  async function install() {
    const event = deferred.current;
    if (!event || busy.current) return;
    // A browser event can only be prompted once, and only from this user tap.
    deferred.current = null;
    busy.current = true;
    setCanInstall(false);
    setInstalling(true);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome === 'accepted') setInstalled(true);
      else dismiss();
    } catch {
      setError('Installation couldn’t open. Try your browser’s “Install app” or “Add to Home Screen” option.');
    } finally {
      busy.current = false;
      setInstalling(false);
    }
  }

  return <InstallContext.Provider value={{
    visible: !installed && Date.now() >= snoozedUntil && (canInstall || ios || installing || Boolean(error)),
    ios, canInstall, installing, error, install, dismiss,
  }}>{children}</InstallContext.Provider>;
}

export function PwaInstallPrompt() {
  const state = useContext(InstallContext);
  const [showSteps, setShowSteps] = useState(false);
  if (!state?.visible) return null;
  return <aside className="pwa-install" aria-label="Install learncn.fun">
    <img src="/icons/app-192.png" width="48" height="48" alt="" className="pwa-install-icon" />
    <div className="pwa-install-copy">
      <strong>Keep Chinese practice handy</strong>
      <p>Add learncn.fun to your home screen.</p>
      {showSteps && <p id="pwa-install-steps" className="pwa-install-steps">Open the Share menu and choose <strong>Add to Home Screen</strong>. Keep <strong>Open as Web App</strong> on if shown, then tap <strong>Add</strong>. If that option is missing, open this page in Safari.</p>}
      {state.error && <p role="status">{state.error}</p>}
    </div>
    <div className="pwa-install-actions">
      {(state.canInstall || state.installing) && <button className="pwa-install-primary" disabled={state.installing} onClick={() => void state.install()}>{state.installing ? 'Opening…' : 'Install app'}</button>}
      {state.ios && !state.canInstall && !state.installing && <button className="pwa-install-primary" aria-expanded={showSteps} aria-controls="pwa-install-steps" onClick={() => setShowSteps(value => !value)}>How to install</button>}
      <button className="pwa-install-dismiss" disabled={state.installing} onClick={state.dismiss}>Not now</button>
    </div>
  </aside>;
}
