import { cn } from '../lib/utils';

export interface EventHeroProps {
  title: string;
  posterImage: string;
  className?: string;
}

export function EventHero({ title, posterImage, className }: EventHeroProps) {
  return (
    <div
      className={cn(
        'relative h-64 w-full overflow-hidden rounded-lg md:h-80',
        className
      )}
    >
      <img
        src={posterImage}
        alt={title}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
