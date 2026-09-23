"use client";

import Link from "next/link";
import { Video as VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBroadcast } from "@/components/broadcast/broadcast-provider";
import { BroadcastStudio } from "@/components/broadcast/broadcast-studio";

// Only the control surface — the broadcast itself lives in the root-level
// provider, so moving around the dashboard does not end the stream.
export const BrowserBroadcast = ({ username }: { username: string }) => {
  const { isBroadcasting, isStarting, start } = useBroadcast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <VideoIcon className="size-5" aria-hidden="true" />
          Go live from your browser
        </CardTitle>
        <CardDescription>
          Stream straight from your camera — no OBS, no stream key. Share your screen,
          switch devices, and keep browsing the site while you are live. Prefer OBS?
          The RTMP and WHIP details are under{" "}
          <Link
            href={`/u/${username}/keys`}
            className="text-primary underline underline-offset-4"
          >
            Keys
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isBroadcasting ? (
          <>
            <BroadcastStudio />
            <p className="text-sm text-muted-foreground">
              You stay live while you move around the site. For a composed screen-and-camera
              layout, open{" "}
              <Link
                href={`/u/${username}/studio`}
                className="text-primary underline underline-offset-4"
              >
                Studio
              </Link>
              , or{" "}
              <Link href={`/${username}`} className="text-primary underline underline-offset-4">
                your channel
              </Link>{" "}
              to watch the stream and read chat.
            </p>
          </>
        ) : (
          <Button onClick={() => void start()} disabled={isStarting}>
            {isStarting ? "Starting…" : "Start broadcasting"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
