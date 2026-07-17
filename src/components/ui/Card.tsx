import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingMap = { sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div className={`rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl ${paddingMap[padding]} ${className}`}>
      {children}
    </div>
  );
}
