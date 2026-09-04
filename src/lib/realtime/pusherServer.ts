import "server-only";
import Pusher from "pusher";
import { coupleChannelName } from "./channel";

let _pusher: Pusher | null = null;

function getPusherServer(): Pusher {
  if (!_pusher) {
    _pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return _pusher;
}

/** Generates the private-channel auth signature for a subscribing socket. */
export function authorizeCoupleChannel(socketId: string, channelName: string) {
  return getPusherServer().authorizeChannel(socketId, channelName);
}

/** Every later feature (pings, live status, reveals, presence) sends through this. */
export async function triggerCoupleEvent(
  coupleId: string,
  eventName: string,
  data: unknown,
): Promise<void> {
  await getPusherServer().trigger(coupleChannelName(coupleId), eventName, data);
}
