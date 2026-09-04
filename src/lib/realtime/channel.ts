// Shared by both pusherServer.ts and pusherClient.ts so the naming
// convention can't drift out of sync between trigger and subscribe sides.
export function coupleChannelName(coupleId: string): string {
  return `private-couple-${coupleId}`;
}
