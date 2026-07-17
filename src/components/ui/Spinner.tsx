interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className = 'h-3.5 w-3.5' }: SpinnerProps) {
  return (
    <span className={`inline-block ${className} animate-spin rounded-full border-2 border-white border-t-transparent`} />
  );
}
