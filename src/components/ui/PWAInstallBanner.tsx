import { usePWA } from '../../hooks/usePWA';
import { Button } from './Button';

export function PWAInstallBanner() {
  const { showInstallPrompt, install, dismiss } = usePWA();

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-40 max-w-sm mx-auto md:mx-0 md:left-auto md:right-4">
      <div className="bg-bg-elevated border border-border rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-gold/20 flex items-center justify-center text-lg flex-shrink-0">
            📲
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Install Habit RPG</p>
            <p className="text-xs text-text-muted mt-0.5">
              Add to your home screen for the best experience.
            </p>
          </div>
          <button onClick={dismiss} className="text-text-muted hover:text-text-primary p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="ghost" size="sm" className="flex-1" onClick={dismiss}>
            Not now
          </Button>
          <Button size="sm" className="flex-1" onClick={install}>
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
