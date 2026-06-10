import { ProgressBar } from '../ui/ProgressBar';
import { useCharacterStore } from '../../store/characterStore';

export function XPBar() {
  const profile = useCharacterStore((s) => s.profile);
  if (!profile) return null;
  return (
    <ProgressBar
      value={profile.xp}
      max={100} // Will be replaced with actual xpForNext
      variant="xp"
      showLabel={true}
    />
  );
}

export function HPBar() {
  const profile = useCharacterStore((s) => s.profile);
  if (!profile) return null;
  return (
    <ProgressBar
      value={profile.hp}
      max={profile.max_hp}
      variant="hp"
      showLabel={true}
    />
  );
}
