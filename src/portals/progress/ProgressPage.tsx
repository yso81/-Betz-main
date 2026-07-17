import { UserChallenge, Challenge } from '../../types';
import { Target, Clock, CheckCircle2, XCircle, Flame } from 'lucide-react';
import { MOCK_CHALLENGES, MOCK_USER_CHALLENGES } from '../../data/mockData';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';
import ProgressBar from '../../components/ui/ProgressBar';

interface ProgressPageProps {
  userChallenges: UserChallenge[];
  challenges: Challenge[];
  onChallengeClick?: (challengeId: string) => void;
}

const statusConfig: Record<string, { icon: typeof Target; color: string; bg: string; label: string }> = {
  ACTIVE: { icon: Target, color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/20', label: 'In Progress' },
  COMPLETED: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Completed' },
  FAILED: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20', label: 'Failed' },
};

export default function ProgressPage({ userChallenges, challenges, onChallengeClick }: ProgressPageProps) {
  const displayChallenges = challenges.length > 0 ? challenges : MOCK_CHALLENGES;
  const displayUserChallenges = userChallenges.length > 0 ? userChallenges : MOCK_USER_CHALLENGES;

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel title="Progress" subtitle="Track your challenge journey" />
        <h2 className="mt-1 text-2xl font-bold text-slate-900">My Challenges</h2>
      </div>

      <div className="space-y-3">
        {displayUserChallenges.map((uc) => {
          const challenge = displayChallenges.find((c) => c.id === uc.challenge_id);
          const config = statusConfig[uc.status] || statusConfig.ACTIVE;
          const StatusIcon = config.icon;
          const daysSince = Math.max(0, Math.floor((Date.now() - new Date(uc.enrolled_at).getTime()) / 86400000));

          return (
            <button
              key={uc.id}
              onClick={() => onChallengeClick?.(uc.challenge_id)}
              className="w-full text-left"
            >
              <Card padding="sm" className="hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {challenge?.title || 'Unknown Challenge'}
                      </h3>
                      {challenge?.challenge_mode === 'daily' && (
                        <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${config.bg} ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                      <span className="text-[9px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {daysSince}d ago
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-extrabold text-slate-900">{uc.progress}%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar
                    value={uc.progress}
                    color={uc.status === 'COMPLETED' ? 'emerald' : uc.status === 'FAILED' ? 'rose' : 'teal'}
                    size="md"
                  />
                </div>

                {challenge && (
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{challenge.category}</span>
                    <span className="text-teal-500 font-bold">{challenge.reward_xp} XP</span>
                  </div>
                )}
              </Card>
            </button>
          );
        })}

        {displayUserChallenges.length === 0 && (
          <Card className="p-8 text-center">
            <Target className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="mt-3 text-sm text-slate-500">No challenges yet. Tap + to create one!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
