interface Props {
  photo: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

export function PlayerAvatar({ photo, name, size = 'md' }: Props) {
  if (!photo) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-nba-blue flex items-center justify-center text-white font-bold shrink-0`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={photo}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover border-2 border-nba-gold/50 shrink-0`}
    />
  );
}
