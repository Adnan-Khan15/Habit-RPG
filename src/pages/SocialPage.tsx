import { useState } from 'react';
import { FriendsList } from '../components/social/FriendsList';
import { LeaderboardTable } from '../components/social/LeaderboardTable';

export default function SocialPage() {
  const [tab, setTab] = useState<'friends' | 'global'>('friends');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-bg-card rounded-lg p-1 border border-border w-fit">
        <button
          onClick={() => setTab('friends')}
          className={`px-4 py-1.5 rounded-md text-sm transition-all ${
            tab === 'friends' ? 'bg-accent-purple/20 text-accent-purple' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setTab('global')}
          className={`px-4 py-1.5 rounded-md text-sm transition-all ${
            tab === 'global' ? 'bg-accent-purple/20 text-accent-purple' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {tab === 'friends' ? <FriendsList /> : <LeaderboardTable />}
    </div>
  );
}
