import { useState } from 'react';
import { ChevronLeft, Camera, MapPin } from 'lucide-react';
import type { CreateFriendBetForm, ConfirmationMethod, FriendProfile } from '../../types';
import FriendPicker from './FriendPicker';
import TextInput from '../ui/TextInput';
import Textarea from '../ui/Textarea';

interface BetAgainstFriendWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: CreateFriendBetForm) => Promise<void>;
}

const STEPS = ['Friend', 'Title', 'Details', 'Stake', 'Tracking'];
const TOTAL_STEPS = STEPS.length;

export default function BetAgainstFriendWizard({ isOpen, onClose, onSubmit }: BetAgainstFriendWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakeDescription, setStakeDescription] = useState('');
  const [confirmationMethod, setConfirmationMethod] = useState<ConfirmationMethod>('photo_video');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canNext = () => {
    if (step === 0) return !!selectedFriend;
    if (step === 1) return title.trim().length > 0;
    if (step === 2) return description.trim().length > 0;
    if (step === 3) return stakeDescription.trim().length > 0;
    if (step === 4) return true;
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setError(null);
      setStep(s => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setError(null);
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFriend) return;
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        stake_description: stakeDescription.trim(),
        confirmation_method: confirmationMethod,
        friend_id: selectedFriend.id,
        friend_username: selectedFriend.username,
      });
      resetForm();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create bet.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setSelectedFriend(null);
    setTitle('');
    setDescription('');
    setStakeDescription('');
    setConfirmationMethod('photo_video');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-amber-500 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={handleBack} className="text-white hover:opacity-70">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-bold text-white text-lg">Bet Against a Friend</h3>
          </div>
          <button onClick={handleClose} className="text-white hover:opacity-70 font-bold text-xl">&times;</button>
        </div>

        {/* Step indicator */}
        <div className="px-5 py-3 flex items-center justify-center gap-2 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all ${
                i < step ? 'bg-amber-500' : i === step ? 'bg-amber-500 scale-125' : 'bg-slate-200'
              }`} />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="px-5 pb-4 flex-1 overflow-y-auto">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
            Step {step + 1} of {TOTAL_STEPS}: {STEPS[step]}
          </p>

          {step === 0 && (
            <FriendPicker
              selectedFriendId={selectedFriend?.id || null}
              onSelect={setSelectedFriend}
            />
          )}

          {step === 1 && (
            <TextInput
              label="Title the bet"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning Run Challenge"
            />
          )}

          {step === 2 && (
            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's the challenge about?"
              className="h-28"
            />
          )}

          {step === 3 && (
            <TextInput
              label="What's at stake?"
              type="text"
              value={stakeDescription}
              onChange={e => setStakeDescription(e.target.value)}
              placeholder="e.g. Loser buys dinner"
            />
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 font-medium">How will you keep track?</p>
              <button
                type="button"
                onClick={() => setConfirmationMethod('photo_video')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  confirmationMethod === 'photo_video'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Camera className={`w-5 h-5 ${confirmationMethod === 'photo_video' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Photo / Video</p>
                    <p className="text-[10px] text-slate-500">Both parties upload proof at the agreed time.</p>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setConfirmationMethod('location')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  confirmationMethod === 'location'
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${confirmationMethod === 'location' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Location Check-in</p>
                    <p className="text-[10px] text-slate-500">App verifies you're at the target location (GPS).</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {error && <p className="text-xs text-rose-500 font-medium mt-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 shrink-0">
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-40 text-sm"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Creating...' : `Challenge ${selectedFriend?.username || 'Friend'}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
