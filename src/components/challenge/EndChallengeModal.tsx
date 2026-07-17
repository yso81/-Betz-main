import { useState, useRef } from 'react';
import { Trophy, Camera, X } from 'lucide-react';
import type { Challenge } from '../../types';
import Textarea from '../ui/Textarea';

interface EndChallengeModalProps {
  isOpen: boolean;
  challenge: Challenge | null;
  onClose: () => void;
  onSubmit: (message: string, mediaUrl?: string) => Promise<void>;
}

export default function EndChallengeModal({ isOpen, challenge, onClose, onSubmit }: EndChallengeModalProps) {
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !challenge) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!message.trim()) {
      setError('Write a quick accountability message.');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl: string | undefined;
      if (mediaFile) {
        const formData = new FormData();
        formData.append('video', mediaFile);
        const uploadRes = await fetch('/api/upload/lobby-video', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          mediaUrl = uploadData.url;
        }
      }
      await onSubmit(message.trim(), mediaUrl);
      setMessage('');
      removeMedia();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit proof.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setMessage('');
    removeMedia();
    onClose();
  };

  const daysCompleted = challenge.duration_days;
  const endText = daysCompleted === 1 ? '1 day' : `${daysCompleted} days`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-teal-500 flex flex-col max-h-[85vh]">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Challenge Complete!
          </h3>
          <button onClick={handleSkip} className="text-white hover:opacity-70 font-bold text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="text-center">
            <h4 className="text-base font-bold text-slate-900">{challenge.title}</h4>
            <p className="text-xs text-slate-500 mt-1">{endText} &bull; {challenge.reward_xp} XP earned</p>
          </div>

          <Textarea
            label="Accountability Box"
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Share your win — what you accomplished, what you learned..."
            className="h-24"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Proof (optional)</label>
            {mediaPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200">
                {mediaFile?.type.startsWith('video/') ? (
                  <video src={mediaPreview} className="w-full h-32 object-cover" controls />
                ) : (
                  <img src={mediaPreview} alt="Proof" className="w-full h-32 object-cover" />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-teal-300 hover:text-teal-500 transition-colors flex flex-col items-center gap-2 cursor-pointer"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs font-semibold">Upload Photo or Video</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={handleSkip} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm">
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Submitting...' : 'Submit Proof'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
