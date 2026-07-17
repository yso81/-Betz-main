import { Users, MapPin } from 'lucide-react';
import type { ChallengeType } from '../../types';
import Card from '../ui/Card';

interface ChallengeTypeSelectorProps {
  isOpen: boolean;
  onSelect: (type: ChallengeType) => void;
  onClose: () => void;
}

const CHALLENGE_TYPES: {
  type: ChallengeType;
  icon: typeof Users;
  title: string;
  subtitle: string;
  gradient: string;
  iconColor: string;
}[] = [
  {
    type: 'friend',
    icon: Users,
    title: 'Bet Against a Friend',
    subtitle: 'Challenge someone directly. Photo, video, or location proof.',
    gradient: 'from-amber-400 to-amber-500',
    iconColor: 'text-amber-500',
  },
  {
    type: 'local',
    icon: MapPin,
    title: 'Bet Locally',
    subtitle: 'Public bet visible to everyone in the lobby. Wager your XP.',
    gradient: 'from-emerald-400 to-emerald-500',
    iconColor: 'text-emerald-500',
  },
];

export default function ChallengeTypeSelector({ isOpen, onSelect, onClose }: ChallengeTypeSelectorProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">Choose Your Bet</h3>
          <button onClick={onClose} className="text-white hover:opacity-70 font-bold text-xl">&times;</button>
        </div>

        <div className="p-5 space-y-3">
          {CHALLENGE_TYPES.map(ct => {
            const Icon = ct.icon;
            return (
              <button
                key={ct.type}
                onClick={() => onSelect(ct.type)}
                className="w-full text-left group"
              >
                <Card padding="sm" className="hover:shadow-lg transition-all border-2 border-transparent hover:border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${ct.gradient} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900">{ct.title}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{ct.subtitle}</p>
                    </div>
                    <span className={`${ct.iconColor} text-lg font-bold group-hover:translate-x-1 transition-transform`}>
                      &rsaquo;
                    </span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
