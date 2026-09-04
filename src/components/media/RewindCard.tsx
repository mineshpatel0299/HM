"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeRise, useReducedMotionSafe } from "@/lib/motion";
import type { RewindItem } from "@/lib/rewind/types";

function weeksAgoLabel(dateKey: string): string {
  const days = Math.round((Date.now() - new Date(dateKey).getTime()) / (24 * 60 * 60 * 1000));
  const weeks = Math.max(1, Math.round(days / 7));
  return weeks === 1 ? "a week ago" : `${weeks} weeks ago`;
}

function RewindBody({
  item,
  myId,
  myName,
  partnerName,
}: {
  item: RewindItem;
  myId: string;
  myName: string;
  partnerName: string;
}) {
  if (item.kind === "moment") {
    return (
      <p className="font-sans text-sm text-ink/80">
        {item.authorId === myId ? myName : partnerName} shared: &ldquo;{item.text}&rdquo;
      </p>
    );
  }
  if (item.kind === "photo") {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image src={item.publicUrl} alt={item.caption ?? ""} fill className="object-cover" />
        </div>
        {item.caption && <p className="font-sans text-sm text-ink/80">{item.caption}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <p className="font-sans text-sm text-ink/70">&ldquo;{item.promptText}&rdquo;</p>
      {item.answers.map((answer) => (
        <p key={answer.authorId} className="font-sans text-sm text-ink/80">
          {answer.authorId === myId ? myName : partnerName}: {answer.text}
        </p>
      ))}
    </div>
  );
}

/** Slightly aged/warmer tint, distinct from current-day content in the
 * feed — a "remember this?" card, not just another moment. */
export function RewindCard({
  item,
  myId,
  myName,
  partnerName,
}: {
  item: RewindItem;
  myId: string;
  myName: string;
  partnerName: string;
}) {
  const { variants } = useReducedMotionSafe();

  return (
    <motion.div
      variants={variants(fadeRise)}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-dashed border-amber/50 bg-amber/10 px-4 py-3"
    >
      <p className="font-sans text-xs text-emberDark/70">remember this? — {weeksAgoLabel(item.date)}</p>
      <div className="mt-1">
        <RewindBody item={item} myId={myId} myName={myName} partnerName={partnerName} />
      </div>
    </motion.div>
  );
}
