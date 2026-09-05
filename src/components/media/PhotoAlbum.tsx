"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { scalePress, springSoft, useReducedMotionSafe } from "@/lib/motion";
import { useUpload } from "@/lib/storage/useUpload";
import { UploadProgress } from "@/components/ui/UploadProgress";
import { addPhoto } from "@/lib/photos/actions";
import { MemoryPhotoCard } from "@/components/media/MemoryPhotoCard";
import type { Photo } from "@/lib/photos/types";

// Independent per-photo tilt so the grid reads as a scattered scrapbook
// rather than a rigid layout — cycled, not random, so it's stable across
// re-renders.
const ROTATIONS = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5];

export function PhotoAlbum({
  coupleId,
  initialPhotos,
}: {
  coupleId: string;
  initialPhotos: Photo[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { status, progress, upload, reset } = useUpload(coupleId, "photos");
  const { transition } = useReducedMotionSafe();

  useEffect(() => {
    if (!selected) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    const uploaded = await upload(file);
    if (!uploaded) return;

    const added = await addPhoto(coupleId, uploaded.key, caption.trim() || null, null);
    if (!added.ok) {
      setError("Uploaded, but couldn't save it — try again.");
      return;
    }
    setPhotos((prev) => [added.photo, ...prev]);
    setCaption("");
    reset();
  }

  const isUploading = status === "requesting" || status === "uploading";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-line bg-paper2 p-4">
        <input
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="caption (optional)"
          className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-xs text-ink outline-none focus:border-ember"
        />
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emberDark px-4 py-2 font-sans text-xs text-paper">
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={isUploading} />
          {isUploading ? `uploading… ${progress}%` : "add a photo"}
        </label>
        {isUploading && <UploadProgress progress={progress} />}
        {error && <p className="font-sans text-xs text-emberDark">{error}</p>}
      </div>

      {photos.length === 0 ? (
        <p className="font-sans text-sm text-ink/70">no photos yet — add the first one.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photo, index) => (
            <motion.button
              key={photo.id}
              layoutId={`photo-${photo.id}`}
              variants={scalePress}
              initial="rest"
              whileTap="tap"
              type="button"
              onClick={() => setSelected(photo)}
              style={{ rotate: ROTATIONS[index % ROTATIONS.length] }}
              className="relative aspect-square overflow-hidden rounded-xl border border-line bg-paper2 shadow-sm"
            >
              <MemoryPhotoCard src={photo.publicUrl} alt={photo.caption ?? ""} />
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition({ duration: 0.2 })}
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-label="photo"
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
          >
            <motion.div
              layoutId={`photo-${selected.id}`}
              transition={transition(springSoft)}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-paper2"
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="close photo"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-paper"
              >
                ×
              </button>
              <div className="relative aspect-square w-full">
                <MemoryPhotoCard src={selected.publicUrl} alt={selected.caption ?? ""} />
              </div>
              {selected.caption && (
                <p className="px-4 py-3 font-sans text-sm text-ink">{selected.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
