export function SkeletonLoader({ className = "", rounded = "rounded-lg" }: { className?: string, rounded?: string }) {
  return <div className={`skeleton ${rounded} ${className}`} />;
}

export function PlaylistCardSkeleton() {
  return (
    <div className="glass-card flex flex-col h-[320px] overflow-hidden">
      <SkeletonLoader className="w-full h-40" rounded="rounded-t-lg rounded-b-none" />
      <div className="p-4 flex-1 flex flex-col gap-3">
        <SkeletonLoader className="w-3/4 h-6" />
        <SkeletonLoader className="w-1/2 h-4" />
        <div className="mt-auto flex justify-between items-center">
          <SkeletonLoader className="w-16 h-4" />
          <SkeletonLoader className="w-10 h-10" rounded="rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function VideoListItemSkeleton() {
  return (
    <div className="flex gap-4 p-3 border-b border-var(--border) items-center">
      <SkeletonLoader className="w-6 h-6 shrink-0" rounded="rounded-md" />
      <SkeletonLoader className="w-32 h-20 shrink-0" rounded="rounded-md" />
      <div className="flex-1 flex flex-col gap-2">
        <SkeletonLoader className="w-full max-w-md h-5" />
        <SkeletonLoader className="w-24 h-4" />
      </div>
    </div>
  );
}
