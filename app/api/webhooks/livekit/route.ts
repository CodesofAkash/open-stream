import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const authorization = headerPayload.get("Authorization");

  if (!authorization) {
    return new Response("No authorization header", { status: 400 });
  }

  const event = await receiver.receive(body, authorization);

  /**
   * Browser broadcasts produce no ingress events — the host is an ordinary
   * participant publishing camera and microphone. The client reports going
   * live, but a closed laptop or lost connection never gets to say "stop", so
   * these events are the safety net that stops a dead channel advertising
   * itself as live.
   *
   * The room is named after the host's user id, and the broadcasting
   * participant uses that same id as its identity.
   */
  if (event.event === "participant_left" || event.event === "room_finished") {
    const roomName = event.room?.name;
    const identity = event.participant?.identity;

    // room_finished has no participant; a viewer leaving must not end the
    // stream, so only the host's own departure counts.
    if (roomName && (event.event === "room_finished" || identity === roomName)) {
      await db.stream.updateMany({
        where: { userId: roomName },
        data: { isLive: false },
      });
      revalidateTag("streams", { expire: 0 });
    }

    return new Response("", { status: 200 });
  }

  if (event.event === "track_published") {
    const roomName = event.room?.name;
    const identity = event.participant?.identity;

    if (roomName && identity === roomName) {
      await db.stream.updateMany({
        where: { userId: roomName },
        data: { isLive: true },
      });
      revalidateTag("streams", { expire: 0 });
    }

    return new Response("", { status: 200 });
  }

  const ingressId = event.ingressInfo?.ingressId;

  // Without an id there is nothing to match — and with updateMany an undefined
  // filter means NO filter, which would flip every stream in the database.
  if (!ingressId) {
    return new Response("", { status: 200 });
  }

  // updateMany, not update: one LiveKit project can notify more than one
  // deployment (local via ngrok, and production), and each only owns its own
  // streams. update() throws when nothing matches, answering the other
  // deployment's events with a 500 that LiveKit then retries.
  if (event.event === "ingress_started") {
    await db.stream.updateMany({ where: { ingressId }, data: { isLive: true } });
  }

  if (event.event === "ingress_ended") {
    await db.stream.updateMany({ where: { ingressId }, data: { isLive: false } });
  }

  // The anonymous stream list is cached for 30s. Going live or ending a stream
  // is exactly when that list is wrong, so drop it now rather than letting a
  // viewer wait out the window.
  // Next 16 requires a cacheLife profile as the second argument.
  revalidateTag("streams", { expire: 0 });

  return new Response("", { status: 200 });
}