import { useState } from 'react';
import { Flame, CheckCircle2, MapPin } from 'lucide-react';
import type { ChallengeMode, ConfirmationMethod } from '../../types';
import Card from '../ui/Card';
import Textarea from '../ui/Textarea';
import LocationCheckin from './LocationCheckin';

interface DailyCheckinBoxProps {
  challengeMode: ChallengeMode;
  confirmationMethod?: ConfirmationMethod;
  isCheckedInToday: boolean;
  streakCount: number;
  targetLat?: number;
  targetLng?: number;
  targetRadiusM?: number;
  onSubmitCheckin: (message: string, mediaUrl?: string, lat?: number, lng?: number) => Promise<void>;
}

export default function DailyCheckinBox({
  challengeMode,
  confirmationMethod,
  isCheckedInToday,
  streakCount,
  targetLat,
  targetLng,
  targetRadiusM = 150,
  onSubmitCheckin,
}: DailyCheckinBoxProps) {
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [locationVerified, setLocationVerified] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Write a quick message about your progress.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmitCheckin(
        message.trim(),
        mediaUrl || undefined,
        locationVerified?.lat,
        locationVerified?.lng
      );
      setMessage('');
      setMediaUrl('');
      setLocationVerified(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationVerified = (lat: number, lng: number) => {
    setLocationVerified({ lat, lng });
  };

  if (isCheckedInToday) {
    return (
      <Card padding="sm" className="bg-emerald-50 border border-emerald-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs font-bold text-emerald-700">Checked in today!</p>
            <p className="text-[10px] text-emerald-600">Keep it up. {streakCount} day streak.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-slate-700">Day {streakCount} of streak</span>
        {challengeMode === 'daily' && (
          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Daily
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          label=""
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="How did it go today?"
          className="h-16"
        />

        {confirmationMethod === 'location' && targetLat && targetLng && (
          <LocationCheckin
            targetLat={targetLat}
            targetLng={targetLng}
            targetRadiusM={targetRadiusM}
            onLocationVerified={handleLocationVerified}
            onLocationFailed={() => {}}
          />
        )}

        {confirmationMethod === 'photo_video' && (
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Photo/Video Proof (optional)</label>
            <input
              type="url"
              value={mediaUrl}
              onChange={e => setMediaUrl(e.target.value)}
              placeholder="Paste image/video URL"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>
        )}

        {locationVerified && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-emerald-700 font-medium">Location verified</span>
          </div>
        )}

        {error && <p className="text-[10px] text-rose-500 font-medium">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !message.trim()}
          className="w-full py-2 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 transition-colors disabled:opacity-50 text-xs"
        >
          {loading ? 'Submitting...' : 'Check In'}
        </button>
      </div>
    </Card>
  );
}
