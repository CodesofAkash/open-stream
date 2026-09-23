"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

import { useBroadcast } from "@/components/broadcast/broadcast-provider";
import CanvasCompositor from "@/components/broadcast/canvas-compositor";

interface StudioPanelProps {
  username: string;
}

// Studio mode composes the tracks of a running broadcast, so there is nothing
// to configure until one exists — and a dead control explains none of that.
function StudioPanel({ username }: StudioPanelProps) {
  const { isBroadcasting } = useBroadcast();

  if (!isBroadcasting) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border p-10 text-center">
        <Layers className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-muted-foreground">
          Studio mode composes a running broadcast. Start one from the{" "}
          <Link href={`/u/${username}`} className="text-primary underline underline-offset-4">
            Stream
          </Link>{" "}
          tab, then come back — it stays live while you do.
        </p>
      </div>
    );
  }

  return <CanvasCompositor />;
}

export default StudioPanel;
