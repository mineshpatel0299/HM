"use client";

import Pusher from "pusher-js";

let _client: Pusher | null = null;

/** Browser-side singleton — every subscription (via RealtimeProvider) shares this one connection. */
export function getPusherClient(): Pusher {
  if (!_client) {
    _client = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return _client;
}
