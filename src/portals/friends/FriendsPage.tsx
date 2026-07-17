import { Trophy, Target } from 'lucide-react';
import { MOCK_FRIENDS, FRIEND_STATUS_COLORS } from '../../data/mockData';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import Avatar from '../../components/ui/Avatar';
import ProgressBar from '../../components/ui/ProgressBar';

export default function FriendsPage() {
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel title="Friends" subtitle="See how your friends are doing" />
        <h2 className="mt-1 text-2xl font-bold text-slate-900">Your Circle</h2>
      </div>

      <div className="space-y-3">
        {MOCK_FRIENDS.map((friend) => (
          <Card key={friend.id} padding="sm">
            <div className="flex items-center gap-3">
              <Avatar username={friend.username} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">@{friend.username}</h3>
                <div className="flex items-center gap-1 text-teal-500 font-bold text-xs">
                  <Trophy className="w-3 h-3" />
                  {friend.total_xp.toLocaleString()} XP
                </div>
              </div>
            </div>

            {friend.activeChallenges.length > 0 && (
              <div className="mt-3 space-y-2">
                {friend.activeChallenges.map((ch, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-700 font-medium truncate">{ch.title}</span>
                        <span className={`text-[9px] font-bold uppercase ${FRIEND_STATUS_COLORS[ch.status]}`}>
                          {ch.status}
                        </span>
                      </div>
                      <div className="mt-1">
                        <ProgressBar value={ch.progress} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
