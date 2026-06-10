import { useState } from 'react';
import { useFriends } from '../../hooks/useFriends';
import { FriendCard } from './FriendCard';
import { Button } from '../ui/Button';
import { useNotificationStore } from '../../store/notificationStore';

export function FriendsList() {
  const { friends, requests, sendRequest, acceptRequest, declineRequest, removeFriend } = useFriends();
  const addToast = useNotificationStore((s) => s.addToast);
  const [searchUsername, setSearchUsername] = useState('');

  const handleSendRequest = async () => {
    if (!searchUsername.trim()) return;
    try {
      await sendRequest.mutateAsync(searchUsername.trim());
      addToast({ type: 'success', title: 'Friend request sent!' });
      setSearchUsername('');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', message: err.message });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-text-muted mb-2">Add Friend</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Enter username..."
            className="input-field flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
          />
          <Button onClick={handleSendRequest} disabled={!searchUsername.trim()}>
            Send Request
          </Button>
        </div>
      </div>

      {requests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-muted mb-2">
            Pending Requests ({requests.length})
          </h3>
          <div className="space-y-2">
            {requests.map((req) => (
              <FriendCard
                key={req.id}
                friend={req}
                isPending
                onAccept={() => acceptRequest.mutate(req.id)}
                onDecline={() => declineRequest.mutate(req.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-muted mb-2">
          Friends ({friends.length})
        </h3>
        {friends.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No friends yet</p>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onRemove={() => removeFriend.mutate(friend.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
