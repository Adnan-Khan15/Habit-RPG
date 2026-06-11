import { useReferral } from '../../hooks/useReferral';

export function ReferralPanel() {
  const { referralCode, referralCount, shareUrl } = useReferral();

  if (!referralCode) return null;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div className="card space-y-3">
      <h3 className="text-sm font-semibold text-text-muted uppercase">Referral Program</h3>
      <p className="text-xs text-text-muted">
        Share your code with friends. When they sign up and complete their first task, you both earn rewards!
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-sm font-mono bg-bg-primary px-3 py-2 rounded border border-border text-accent-gold">
          {referralCode}
        </code>
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-xs bg-accent-gold/10 border border-accent-gold text-accent-gold rounded-lg hover:bg-accent-gold/20 transition-colors"
        >
          Copy Link
        </button>
      </div>
      {referralCount > 0 && (
        <p className="text-sm text-text-primary">
          {referralCount} friend{referralCount > 1 ? 's' : ''} joined! 🎉
        </p>
      )}
    </div>
  );
}
