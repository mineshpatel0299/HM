"use client";

import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { scalePress, sealBreak, useReducedMotionSafe } from "@/lib/motion";
import { useUpload } from "@/lib/storage/useUpload";
import { UploadProgress } from "@/components/ui/UploadProgress";
import { createTimeCapsule } from "@/lib/timecapsules/actions";
import { MemoryPhotoCard } from "@/components/media/MemoryPhotoCard";
import type { TimeCapsule as TimeCapsuleRow } from "@/lib/timecapsules/types";

const AUDIO_EXT = /\.(mp3|wav|m4a|webm|ogg|aac)$/i;

function formatCountdown(unlockAt: string): string {
  const diffMs = new Date(unlockAt).getTime() - Date.now();
  if (diffMs <= 0) return "unlocking soon";
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  if (days === 1) return "1 day left";
  if (days < 60) return `${days} days left`;
  return `${Math.round(days / 30)} months left`;
}

function Composer({
  coupleId,
  myId,
  nextVisitDate,
  onCreated,
}: {
  coupleId: string;
  myId: string;
  nextVisitDate: string | null;
  onCreated: (capsule: TimeCapsuleRow) => void;
}) {
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status, progress, key, upload, reset } = useUpload(coupleId, "capsules");

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) upload(file);
  }

  async function handleSeal() {
    if (!content.trim() || !unlockDate) return;
    setIsSaving(true);
    setError(null);

    const unlockAtIso = new Date(`${unlockDate}T12:00:00`).toISOString();
    const result = await createTimeCapsule(coupleId, content.trim(), key, unlockAtIso);
    setIsSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    onCreated({
      id: `pending-${Date.now()}`,
      coupleId,
      authorId: myId,
      content: null,
      publicUrl: null,
      unlockAt: unlockAtIso,
      unlocked: false,
      justUnlocked: false,
      createdAt: new Date().toISOString(),
    });
    setContent("");
    setUnlockDate("");
    reset();
  }

  const isUploading = status === "requesting" || status === "uploading";

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-paper2 p-4">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={3}
        placeholder="write a message for later..."
        aria-label="time capsule message"
        className="rounded-xl border border-line bg-paper px-3 py-2 font-sans text-sm text-ink outline-none focus:border-ember"
      />
      <label className="flex cursor-pointer items-center gap-2 font-sans text-xs text-ink/70">
        <input
          type="file"
          accept="image/*,audio/*"
          className="hidden"
          onChange={handleFile}
          disabled={isUploading}
        />
        <span className="rounded-full border border-line px-3 py-1.5">
          {status === "done" ? "attached ✓" : isUploading ? "uploading…" : "attach a photo or voice note (optional)"}
        </span>
      </label>
      {isUploading && <UploadProgress progress={progress} />}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={unlockDate}
          onChange={(event) => setUnlockDate(event.target.value)}
          aria-label="unlock date"
          className="rounded-lg border border-line bg-paper px-3 py-2 font-sans text-xs text-ink outline-none focus:border-ember"
        />
        {nextVisitDate && (
          <button
            type="button"
            onClick={() => setUnlockDate(nextVisitDate)}
            className="rounded-full border border-line px-3 py-1.5 font-sans text-xs text-ink/70"
          >
            unlock at next visit
          </button>
        )}
      </div>

      {error && <p className="font-sans text-xs text-emberDark">{error}</p>}

      <motion.button
        variants={scalePress}
        initial="rest"
        whileTap="tap"
        type="button"
        onClick={handleSeal}
        disabled={isSaving || !content.trim() || !unlockDate}
        className="self-start rounded-full bg-ink px-4 py-2 font-sans text-xs text-paper disabled:opacity-50"
      >
        {isSaving ? "sealing…" : "seal it"}
      </motion.button>
    </div>
  );
}

function CapsuleCard({
  capsule,
  myId,
  myName,
  partnerName,
}: {
  capsule: TimeCapsuleRow;
  myId: string;
  myName: string;
  partnerName: string;
}) {
  const { variants } = useReducedMotionSafe();

  if (!capsule.unlocked) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-paper2 px-4 py-4 text-center">
        <p className="font-display text-lg text-ink">🔒 sealed</p>
        <p className="mt-1 font-sans text-xs text-ink/70">
          opens {new Date(capsule.unlockAt).toLocaleDateString()}
        </p>
        <p className="mt-1 font-sans text-xs text-ink/70">{formatCountdown(capsule.unlockAt)}</p>
      </div>
    );
  }

  const isAudio = capsule.publicUrl ? AUDIO_EXT.test(capsule.publicUrl) : false;

  const body = (
    <div className="rounded-2xl border border-line bg-paper2 px-4 py-4">
      <p className="font-sans text-xs text-ink/70">
        from {capsule.authorId === myId ? myName : partnerName} — opened{" "}
        {new Date(capsule.unlockAt).toLocaleDateString()}
      </p>
      <p className="mt-2 font-sans text-sm text-ink">{capsule.content}</p>
      {capsule.publicUrl && isAudio && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio controls src={capsule.publicUrl} className="mt-2 w-full" />
      )}
      {capsule.publicUrl && !isAudio && (
        <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg">
          <MemoryPhotoCard src={capsule.publicUrl} alt="" />
        </div>
      )}
    </div>
  );

  if (capsule.justUnlocked) {
    return (
      <motion.div variants={variants(sealBreak)} initial="hidden" animate="visible">
        {body}
      </motion.div>
    );
  }
  return body;
}

export function TimeCapsule({
  coupleId,
  myId,
  myName,
  partnerName,
  nextVisitDate,
  initialCapsules,
}: {
  coupleId: string;
  myId: string;
  myName: string;
  partnerName: string;
  nextVisitDate: string | null;
  initialCapsules: TimeCapsuleRow[];
}) {
  const [capsules, setCapsules] = useState(initialCapsules);

  return (
    <div className="flex flex-col gap-4">
      <Composer
        coupleId={coupleId}
        myId={myId}
        nextVisitDate={nextVisitDate}
        onCreated={(capsule) => setCapsules((prev) => [capsule, ...prev])}
      />
      {capsules.length === 0 ? (
        <p className="font-sans text-sm text-ink/70">no capsules yet — seal the first one.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {capsules.map((capsule) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              myId={myId}
              myName={myName}
              partnerName={partnerName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
