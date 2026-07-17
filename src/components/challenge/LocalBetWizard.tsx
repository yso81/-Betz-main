import { useState, useRef } from 'react';
import { ChevronLeft, Minus, Plus, Image, X } from 'lucide-react';
import type { CreateLocalBetForm } from '../../types';
import TextInput from '../ui/TextInput';
import Textarea from '../ui/Textarea';

interface LocalBetWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: CreateLocalBetForm) => Promise<void>;
  currentXP: number;
}

const STEPS = ['Title', 'Details', 'Duration', 'Points', 'Media'];
const TOTAL_STEPS = STEPS.length;

const DURATION_UNITS: { value: string; label: string; toDays: number }[] = [
  { value: 'days', label: 'Days', toDays: 1 },
  { value: 'weeks', label: 'Weeks', toDays: 7 },
  { value: 'months', label: 'Months', toDays: 30 },
  { value: 'years', label: 'Years', toDays: 365 },
];

export default function LocalBetWizard({ isOpen, onClose, onSubmit, currentXP }: LocalBetWizardProps) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationAmount, setDurationAmount] = useState(1);
  const [durationUnit, setDurationUnit] = useState('weeks');
  const [wagerXP, setWagerXP] = useState(50);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const durationDays = durationAmount * (DURATION_UNITS.find(u => u.value === durationUnit)?.toDays || 7);

  const canNext = () => {
    if (step === 0) return title.trim().length > 0;
    if (step === 1) return description.trim().length > 0;
    if (step === 2) return durationAmount > 0;
    if (step === 3) return wagerXP > 0 && wagerXP <= currentXP;
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

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      let mediaUrl: string | undefined;
      if (mediaFile) {
        const formData = new FormData();
        formData.append('media', mediaFile);
        const uploadRes = await fetch('/api/upload/media', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          mediaUrl = uploadData.url;
        }
      }
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        duration_days: durationDays,
        wager_xp: wagerXP,
        media_url: mediaUrl,
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
    setTitle('');
    setDescription('');
    setDurationAmount(1);
    setDurationUnit('weeks');
    setWagerXP(50);
    removeMedia();
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-emerald-500 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={handleBack} className="text-white hover:opacity-70">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h3 className="font-bold text-white text-lg">Bet Locally</h3>
          </div>
          <button onClick={handleClose} className="text-white hover:opacity-70 font-bold text-xl">&times;</button>
        </div>

        {/* Step indicator */}
        <div className="px-5 py-3 flex items-center justify-center gap-2 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full transition-all ${
                i < step ? 'bg-emerald-500' : i === step ? 'bg-emerald-500 scale-125' : 'bg-slate-200'
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
            <TextInput
              label="Title the bet"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Push-Up Challenge"
            />
          )}

          {step === 1 && (
            <Textarea
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's the challenge about?"
              className="h-28"
            />
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">How long will this bet run?</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Amount</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={durationAmount}
                    onChange={e => setDurationAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center text-2xl font-extrabold text-emerald-600 bg-slate-100 rounded-xl py-3 outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Unit</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DURATION_UNITS.map(u => (
                      <button
                        key={u.value}
                        type="button"
                        onClick={() => setDurationUnit(u.value)}
                        className={`py-2.5 rounded-lg text-[10px] font-bold transition-all ${
                          durationUnit === u.value
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-[10px] text-slate-400">
                Total: <span className="font-bold text-emerald-600">{durationDays} {durationDays === 1 ? 'day' : 'days'}</span>
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">How many points to put up?</p>
                <p className="text-[10px] text-slate-400">Your balance: <span className="font-bold text-emerald-600">{currentXP} XP</span></p>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => setWagerXP(Math.max(10, wagerXP - 10))}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-emerald-600">{wagerXP}</span>
                  <span className="text-sm font-bold text-emerald-400 ml-1">XP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWagerXP(Math.min(currentXP, wagerXP + 10))}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              {wagerXP > currentXP && (
                <p className="text-[10px] text-rose-500 text-center font-medium">You don't have enough XP.</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-bold text-slate-700">Background for your bet</p>
              </div>
              <p className="text-[10px] text-slate-400">
                This photo or video will be shown as the background on the home page.
              </p>
              {mediaPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200">
                  {mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} className="w-full h-32 object-cover" controls />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full h-32 object-cover" />
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
                  className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors flex flex-col items-center gap-2 cursor-pointer"
                >
                  <Image className="w-6 h-6" />
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
          )}

          {error && <p className="text-xs text-rose-500 font-medium mt-2">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 shrink-0">
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-40 text-sm"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? 'Publishing...' : 'Publish Locally'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
