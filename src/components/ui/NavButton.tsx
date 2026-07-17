import { type LucideIcon } from 'lucide-react';

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
  large?: boolean;
}

export default function NavButton({ icon: Icon, label, isActive, onClick, large }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
        isActive ? 'bg-teal-500/20 text-teal-400' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon className={large ? 'w-6 h-6' : 'w-5 h-5'} />
      <span className="text-[9px] font-bold">{label}</span>
    </button>
  );
}
