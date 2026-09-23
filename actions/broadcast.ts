"use server";

import { AccessToken } from "livekit-server-sdk";
import { revalidatePath, revalidateTag } from "next/cache";

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";

/**
 * Going live straight from the browser, without OBS or an ingress.
 *
 * There are three ways into LiveKit and only two of them are ingresses:
 *
 *   RTMP  — LiveKit transcodes it. The free plan allows 60 transcode minutes
 *           a month, so this is the expensive path and runs out quickly.
 *   WHIP  — no transcoding, but still an ingress.
 *   this  — the host joins their own room as an ordinary participant and
 *           publishes camera and microphone.
 *
 * Both ingress paths share a cap of 2 concurrent sessions on the free plan.
 * Publishing as a participant does not touch that cap at all: it counts
 * against the 100-participant pool instead, and uses no transcode minutes. So
 * this is the path that lets several people stream at once for free — and it
 * asks a visitor for nothing but camera permission.
 *
 * RTMP and WHIP stay available for anyone who wants to use OBS.
 */
export const createBroadcastToken = async () => {
  const self = await getSelf();

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      // The viewer token uses this prefix for the host, and the player looks
      // the host up by the room's own id, so the identity must stay the bare
      // user id here — this participant IS the channel.
      identity: self.id,
      name: self.username,
    },
  );

  token.addGrant({
    room: self.id,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
  });

  return await token.toJwt();
};

/**
 * Mark the channel live.
 *
 * For ingress streams the LiveKit webhook owns this flag. A browser broadcast
 * produces no ingress events, so the client says when it starts and stops, and
 * the webhook's participant_left / room_finished handling is the safety net
 * for a tab that closes without telling us.
 */
export const setBroadcastLive = async (isLive: boolean) => {
  const self = await getSelf();

  await db.stream.updateMany({
    where: { userId: self.id },
    data: { isLive },
  });

  revalidateTag("streams", { expire: 0 });
  revalidatePath(`/${self.username}`);

  return { isLive };
};
