import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import type { Profile } from '../../types';

interface FriendCardProps {
  friend: Profile;
  onRemove?: (id: string) => void;
  isPending?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function FriendCard({ friend, onRemove, isPending, onAccept, onDecline }: FriendCardProps) {
  return (
    <div className="card-hover flex items-center gap-3">
      <Avatar name={friend.display_name || friend.username} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {friend.display_name || friend.username}
        </p>
        <p className="text-xs text-text-muted mono">Lv.{friend.level}</p>
      </div>
      {isPending ? (
        <div className="flex gap-1">
          <Button size="sm" onClick={onAccept}>Accept</Button>
          <Button size="sm" variant="ghost" onClick={onDecline}>✕</Button>
        </div>
      ) : onRemove && (
        <Button size="sm" variant="ghost" onClick={() => onRemove(friend.id)}>
          ✕
        </Button>
      )}
    </div>
  );
}
