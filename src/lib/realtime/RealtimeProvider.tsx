"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Channel } from "pusher-js";
import { getPusherClient } from "./pusherClient";
import { coupleChannelName } from "./channel";

const RealtimeContext = createContext<Channel | null>(null);

/**
 * Subscribes to the couple's private channel once at the app shell level
 * (src/app/(app)/layout.tsx). Every feature reads from it via
 * useRealtimeEvent rather than opening its own Pusher subscription.
 */
export function RealtimeProvider({
  coupleId,
  children,
}: {
  coupleId: string;
  children: ReactNode;
}) {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const subscribed = getPusherClient().subscribe(coupleChannelName(coupleId));
    setChannel(subscribed);
    return () => {
      getPusherClient().unsubscribe(coupleChannelName(coupleId));
      setChannel(null);
    };
  }, [coupleId]);

  return <RealtimeContext.Provider value={channel}>{children}</RealtimeContext.Provider>;
}

/** Binds `eventName` on the shared couple channel for as long as the caller is mounted. */
export function useRealtimeEvent<T = unknown>(
  eventName: string,
  callback: (data: T) => void,
): void {
  const channel = useContext(RealtimeContext);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!channel) return;
    const handler = (data: T) => callbackRef.current(data);
    channel.bind(eventName, handler);
    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channel, eventName]);
}
