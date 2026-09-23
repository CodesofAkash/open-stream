"use client";

import Link from "next/link";
import { Video as VideoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBroadcast } from "@/components/broadcast/broadcast-provider";
import { BroadcastStudio } from "@/components/broadcast/broadcast-studio";

/**
 * The card on the Keys page. The broadcast itself lives in the root-level
 * provider, so this is only the control surface: leaving this page no longer
 * ends the stream.
 */
export const BrowserBroadcast = ({ username }: { username: string }) => {
  const { isBroadcasting, isStarting, start } = useBroadcast();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <VideoIcon className="size-5" />
          Go live from your browser
        </CardTitle>
        <CardDescription>
          Stream straight from your camera — no OBS, no stream key. Share your screen,
          switch devices, and keep browsing the site while you are live. Use the RTMP or
          WHIP keys below instead if you prefer OBS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isBroadcasting ? (
          <>
            <BroadcastStudio />
            <p className="text-sm text-muted-foreground">
              You stay live while you move around the site.{" "}
              <Link href={`/${username}`} className="text-primary underline underline-offset-4">
                Open your channel
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
