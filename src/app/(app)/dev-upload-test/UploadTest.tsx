"use client";

import { useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { scalePress } from "@/lib/motion";
import { useUpload } from "@/lib/storage/useUpload";
import { UploadProgress } from "@/components/ui/UploadProgress";

export function UploadTest({ coupleId }: { coupleId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, progress, publicUrl, error, upload, reset } = useUpload(coupleId, "photos");

  const isBusy = status === "requesting" || status === "uploading";

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    reset();
    upload(file);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <h2 className="font-display text-2xl">upload test</h2>
      <p className="font-sans text-sm text-ink/70">
        proves a photo goes straight to R2 and comes back by its public URL.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        onClick={handlePick}
        disabled={isBusy}
        className="rounded-2xl bg-emberDark px-5 py-3 font-sans text-sm text-paper disabled:opacity-60"
      >
        {status === "uploading"
          ? `uploading… ${progress}%`
          : status === "requesting"
            ? "starting…"
            : "choose a photo"}
      </motion.button>

      {isBusy && <UploadProgress progress={progress} />}
      {error && <p className="font-sans text-sm text-emberDark">{error}</p>}

      {publicUrl && (
        <div className="flex flex-col gap-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-line">
            <Image src={publicUrl} alt="uploaded test" fill className="object-cover" />
          </div>
          <p className="break-all font-sans text-xs text-ink/70">{publicUrl}</p>
        </div>
      )}
    </div>
  );
}
