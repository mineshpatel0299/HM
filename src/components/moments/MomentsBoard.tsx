"use client";

import { useState } from "react";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";
import { MomentComposer } from "./MomentComposer";
import { MomentFeed } from "./MomentFeed";
import type { MomentEvent } from "@/lib/moments/types";

/**
 * Owns the shared moments list so MomentComposer's optimistic post and the
 * partner's live posts (via Pusher) both feed the same array — the two
 * components stay decoupled, connected only through this state.
 */
export function MomentsBoard({
  coupleId,
  myId,
  myName,
  partnerName,
  initialMoments,
}: {
  coupleId: string;
  myId: string;
  myName: string;
  partnerName: string;
  initialMoments: MomentEvent[];
}) {
  const [moments, setMoments] = useState(initialMoments);

  useRealtimeEvent<MomentEvent>("moment:posted", (event) => {
    // My own posts are already shown optimistically by handlePosted below —
    // only the partner's need to arrive via the broadcast.
    if (event.coupleId !== coupleId || event.authorId === myId) return;
    setMoments((prev) => [event, ...prev]);
  });

  function handlePosted(moment: MomentEvent) {
    setMoments((prev) => [moment, ...prev]);
  }

  return (
    <div className="flex flex-col gap-4">
      <MomentComposer coupleId={coupleId} myId={myId} onPosted={handlePosted} />
      <MomentFeed moments={moments} myId={myId} myName={myName} partnerName={partnerName} />
    </div>
  );
}
