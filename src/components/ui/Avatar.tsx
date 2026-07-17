interface AvatarProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  imageUrl?: string;
}

const sizeMap = {
  sm: 'w-9 h-9 text-sm',
  md: 'w-12 h-12 text-base',
  lg: 'w-20 h-20 text-3xl',
};

export default function Avatar({ username, size = 'sm', className = '', imageUrl }: AvatarProps) {
  return (
    <div className={`${sizeMap[size]} bg-teal-500 rounded-full text-white font-extrabold flex items-center justify-center uppercase shrink-0 overflow-hidden ${className}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={username} className="h-full w-full object-cover" />
      ) : (
        username[0].toUpperCase()
      )}
    </div>
  );
}
