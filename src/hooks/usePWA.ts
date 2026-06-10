import { useEffect, useState } from 'react';

export function usePWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem('pwa_install_dismissed') === 'true'
  );

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    setSupportsPWA('serviceWorker' in navigator);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissed) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isDismissed]);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  return { supportsPWA, showInstallPrompt, install, dismiss };
}
