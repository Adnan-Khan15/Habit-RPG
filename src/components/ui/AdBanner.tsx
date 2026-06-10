import { useEffect } from 'react';

export function AdBanner() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch {
        // AdSense blocked or not loaded
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-[90px] bg-bg-card rounded-lg border border-border flex items-center justify-center overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
        data-ad-slot="your-ad-slot"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
