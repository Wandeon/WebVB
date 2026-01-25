import { cn } from '../lib/utils';

export interface PostCardSkeletonProps {
  className?: string;
}

export function PostCardSkeleton({ className }: PostCardSkeletonProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="aspect-video animate-pulse bg-neutral-200" />
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-5 w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="h-6 w-full animate-pulse rounded bg-neutral-200" />
        <div className="mt-1 h-6 w-3/4 animate-pulse rounded bg-neutral-200" />
        <div className="mt-2 h-4 w-full animate-pulse rounded bg-neutral-200" />
        <div className="mt-1 h-4 w-5/6 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  );
}
