interface ProgressBarProps {
  value: number;
  color?: 'teal' | 'emerald' | 'rose';
  size?: 'sm' | 'md';
}

const colorMap = {
  teal: 'bg-teal-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const sizeMap = {
  sm: 'h-1.5',
  md: 'h-2',
};

export default function ProgressBar({ value, color = 'teal', size = 'sm' }: ProgressBarProps) {
  return (
    <div className={`${sizeMap[size]} bg-slate-100 rounded-full overflow-hidden`}>
      <div
        className={`h-full ${colorMap[color]} rounded-full transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
