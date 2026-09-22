import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";
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

  return new Response("", { status: 200 });
}