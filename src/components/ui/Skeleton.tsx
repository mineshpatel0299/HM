/**
 * Plain CSS pulse (Tailwind's animate-pulse), not Framer Motion — this
 * renders on the server before any client JS (or a reduced-motion
 * preference) is known, so it can't reach for useReducedMotionSafe.
 * The pulse itself is neutralized under prefers-reduced-motion globally
 * in globals.css instead.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink/10 ${className}`} aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-10" role="status" aria-label="loading">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-48" />
      </div>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
