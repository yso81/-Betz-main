interface SectionLabelProps {
  title: string;
  subtitle?: string;
}

export default function SectionLabel({ title, subtitle }: SectionLabelProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
