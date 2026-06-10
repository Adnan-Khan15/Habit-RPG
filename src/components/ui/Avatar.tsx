interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
}

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-lg' };

export function Avatar({ src, name = '?', size = 'md', isOnline, className = '' }: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const onlineDot = isOnline !== undefined && (
    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-bg-primary ${isOnline ? 'bg-accent-green' : 'bg-text-muted'}`} />
  );

  if (src) {
    return (
      <div className={`relative inline-flex ${className}`}>
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size]} rounded-full object-cover`}
        />
        {onlineDot}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeMap[size]} rounded-full bg-accent-purple/20 text-accent-purple font-semibold ${className}`}>
      {initial}
      {onlineDot}
    </div>
  );
}
