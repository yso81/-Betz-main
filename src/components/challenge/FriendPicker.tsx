import { useState } from 'react';
import { Search } from 'lucide-react';
import { MOCK_FRIENDS } from '../../data/mockData';
import type { FriendProfile } from '../../types';
import Avatar from '../ui/Avatar';

interface FriendPickerProps {
  selectedFriendId: string | null;
  onSelect: (friend: FriendProfile) => void;
}

export default function FriendPicker({ selectedFriendId, onSelect }: FriendPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const friends: FriendProfile[] = MOCK_FRIENDS.map(f => ({
    id: f.id,
    username: f.username,
    total_xp: f.total_xp,
  }));

  const filtered = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (friends.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-slate-500">Add friends first!</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pick your opponent</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search friends..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </div>

      <div className="max-h-[280px] overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No friends found.</p>
        ) : (
          filtered.map(friend => {
            const mockFriend = MOCK_FRIENDS.find(f => f.id === friend.id);
            const activeCount = mockFriend?.activeChallenges.filter(c => c.status === 'ACTIVE').length ?? 0;
            const isSelected = selectedFriendId === friend.id;

            return (
              <button
                key={friend.id}
                onClick={() => onSelect(friend)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isSelected
                    ? 'border-2 border-amber-400 bg-amber-50'
                    : 'border-2 border-transparent bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Avatar username={friend.username} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{friend.username}</p>
                  <p className="text-[11px] text-slate-500">
                    {activeCount > 0 ? `${activeCount} active` : 'No active challenges'}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400 shrink-0">{friend.total_xp} XP</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
