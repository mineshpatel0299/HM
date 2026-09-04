import { NextResponse } from "next/server";
import { assertCoupleMember, CoupleAccessError } from "@/lib/db/assertCoupleMember";
import { authorizeCoupleChannel } from "@/lib/realtime/pusherServer";

const CHANNEL_PATTERN = /^private-couple-(.+)$/;

export async function POST(request: Request) {
  const formData = await request.formData();
  const socketId = String(formData.get("socket_id") ?? "");
  const channelName = String(formData.get("channel_name") ?? "");

  if (!socketId || !channelName) {
    return NextResponse.json({ error: "Missing socket_id or channel_name." }, { status: 400 });
  }

  const match = channelName.match(CHANNEL_PATTERN);
  if (!match) {
    return NextResponse.json({ error: "Unrecognized channel." }, { status: 403 });
  }
  const coupleId = match[1];

  try {
    await assertCoupleMember(coupleId);
  } catch (error) {
    if (error instanceof CoupleAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }

  const authResponse = authorizeCoupleChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
