"use client";

import { useCallback, useState } from "react";
import { useRealtimeEvent } from "@/lib/realtime/RealtimeProvider";

export type MutualEntry = {
  authorId: string;
  /** Scopes the event to "today's prompt" / "today's date" so a stale
   * broadcast from a different day can't leak into the current view. */
  key: string;
  text: string;
};

/**
 * Shared "neither partner sees the other's answer until both have
 * submitted" mechanic for SparkCard and ParallelDiary. `initialPartner`
 * should already be null unless the server confirmed both sides are in —
 * this hook doesn't re-check that, it just tracks state and listens for the
 * live case (partner submits while I'm already on the page).
 */
export function useMutualReveal(
  eventName: string,
  key: string,
  myId: string,
  initialMine: string | null,
  initialPartner: string | null,
) {
  const [mine, setMineState] = useState(initialMine);
  const [partner, setPartner] = useState(initialPartner);

  useRealtimeEvent<MutualEntry>(eventName, (event) => {
    if (event.key !== key || event.authorId === myId) return;
    setPartner(event.text);
  });

  const setMine = useCallback((text: string) => setMineState(text), []);

  return {
    mine,
    partner,
    bothRevealed: mine !== null && partner !== null,
    setMine,
  };
}
