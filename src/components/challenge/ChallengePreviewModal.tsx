import { useState } from 'react';
import { ArrowLeft, Users, Zap, Flame, Calendar, Trophy } from 'lucide-react';
import type { Challenge } from '../../types';
import { CATEGORY_COLORS } from '../../data/mockData';
import Avatar from '../ui/Avatar';

interface ChallengePreviewModalProps {
  isOpen: boolean;
  challenge: Challenge | null;
  onClose: () => void;
  onJoin: (challengeId: string) => Promise<void>;
}

export default function ChallengePreviewModal({ isOpen, challenge, onClose, onJoin }: ChallengePreviewModalProps) {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !challenge) return null;

  const handleJoin = async () => {
    setError(null);
    setJoining(true);
    try {
      await onJoin(challenge.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-teal-500 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-teal-400 to-teal-500 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-white hover:opacity-70">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-white text-lg">Challenge Details</h3>
          </div>
          <button onClick={onClose} className="text-white hover:opacity-70 font-bold text-xl">&times;</button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 flex-1 overflow-y-auto space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit ${CATEGORY_COLORS[challenge.category] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              {challenge.category}
            </span>
            {challenge.challenge_mode === 'daily' && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <Flame className="w-2.5 h-2.5" />
                Daily
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{challenge.title}</h2>

          {/* Creator */}
          <div className="flex items-center gap-2">
            <Avatar username={challenge.creator_username} size="sm" />
            <span className="text-xs text-slate-500">Created by <span className="font-bold text-slate-700">@{challenge.creator_username}</span></span>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">{challenge.description}</p>

          {/* Stake */}
          {challenge.stake_description && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">What's at stake</p>
              <p className="text-xs text-amber-800">{challenge.stake_description}</p>
            </div>
          )}

          {/* Location */}
          {challenge.location_name && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location</p>
              <p className="text-xs text-slate-700">{challenge.location_name}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-center">
              <Calendar className="w-4 h-4 text-teal-500 mx-auto mb-1" />
              <p className="text-sm font-extrabold text-slate-900">{challenge.duration_days}</p>
              <p className="text-[9px] text-slate-400 font-medium">{challenge.duration_days === 1 ? 'Day' : 'Days'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-center">
              <Users className="w-4 h-4 text-teal-500 mx-auto mb-1" />
              <p className="text-sm font-extrabold text-slate-900">{challenge.participants_count}</p>
              <p className="text-[9px] text-slate-400 font-medium">Joined</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-center">
              <Trophy className="w-4 h-4 text-teal-500 mx-auto mb-1" />
              <p className="text-sm font-extrabold text-teal-600">{challenge.reward_xp}</p>
              <p className="text-[9px] text-slate-400 font-medium">XP</p>
            </div>
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 shrink-0">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full py-2.5 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
          >
            {joining ? (
              'Joining...'
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Accept Challenge
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
