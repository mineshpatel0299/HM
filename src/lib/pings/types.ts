export type PingKind = "ping" | "haptic" | "heartbeat";

export type HapticPayload = {
  name: string;
  /** Alternating vibrate/pause durations in ms, ready for navigator.vibrate(). */
  pattern: number[];
};

export type HeartbeatPayload = {
  bpm: number;
  /** Ms between successive detected beats, for driving per-beat animation. */
  intervals: number[];
};

export type PingPayload = HapticPayload | HeartbeatPayload | null;

export type PingEvent = {
  id: string;
  coupleId: string;
  fromId: string;
  toId: string;
  kind: PingKind;
  payload: PingPayload;
  createdAt: string;
};
