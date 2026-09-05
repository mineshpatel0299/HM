"use client";

import { useState } from "react";
import Image from "next/image";

interface MemoryPhotoCardProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fill?: boolean;
}

export function MemoryPhotoCard({
  src,
  alt = "Memory photo",
  className = "",
  fill = true,
}: MemoryPhotoCardProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-rose-300/60 bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-rose-500/10 p-4 text-center ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-sm border border-rose-200/80 text-rose-500 font-display text-2xl font-bold select-none">
          ?
        </div>
        <p className="mt-2 font-sans text-[11px] font-medium text-ink-muted">
          Photo unavailable
        </p>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      unoptimized
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
}
