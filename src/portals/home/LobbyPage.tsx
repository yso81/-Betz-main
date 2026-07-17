import { Challenge } from '../../types';
import { Users, Zap, Flame } from 'lucide-react';
import { MOCK_CHALLENGES, CATEGORY_COLORS } from '../../data/mockData';
import Card from '../../components/ui/Card';
import SectionLabel from '../../components/ui/SectionLabel';

interface LobbyPageProps {
  challenges: Challenge[];
  onChallengeClick?: (challengeId: string) => void;
}

const isVideo = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

export default function LobbyPage({ challenges, onChallengeClick }: LobbyPageProps) {
  const allChallenges = challenges.length > 0 ? challenges : MOCK_CHALLENGES;
  const displayChallenges = allChallenges.filter(c => c.challenge_type === 'local');

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel title="Lobby" subtitle="Discover what your peers are working on" />
        <h2 className="mt-1 text-2xl font-bold text-teal-400">Peer Challenges</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {displayChallenges.map((challenge) => {
          const hasMedia = !!challenge.media_url;

          return (
            <button
              key={challenge.id}
              onClick={() => onChallengeClick?.(challenge.id)}
              className="text-left"
            >
              <Card padding="sm" className={`relative overflow-hidden hover:shadow-md transition-all h-full ${hasMedia ? 'min-h-[180px] flex flex-col justify-end' : ''}`}>
                {hasMedia && challenge.media_url && (
                  <>
                    {isVideo(challenge.media_url) ? (
                      <video
                        src={challenge.media_url}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop
                      />
                    ) : (
                      <img
                        src={challenge.media_url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </>
                )}

                <div className={`relative z-10 ${hasMedia ? 'flex flex-col gap-1' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border w-fit ${hasMedia ? 'bg-white/20 text-white border-white/30' : CATEGORY_COLORS[challenge.category] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {challenge.category}
                    </span>
                    {challenge.challenge_mode === 'daily' && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Flame className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <h3 className={`mt-1 text-sm font-bold leading-tight ${hasMedia ? 'text-white' : 'text-slate-900'}`}>{challenge.title}</h3>
                  <p className={`text-[10px] leading-relaxed line-clamp-2 ${hasMedia ? 'text-white/70' : 'text-slate-500'}`}>{challenge.description}</p>
                  <div className={`mt-auto pt-2 flex items-center justify-between text-[10px] ${hasMedia ? 'text-white/60' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {challenge.participants_count}
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${hasMedia ? 'text-emerald-300' : 'text-teal-500'}`}>
                      <Zap className="w-3 h-3" />
                      {challenge.reward_xp} XP
                    </span>
                  </div>
                  <div className={`text-[9px] font-mono ${hasMedia ? 'text-white/50' : 'text-slate-400'}`}>
                    @{challenge.creator_username}
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
