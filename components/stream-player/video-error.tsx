import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Contained to the video's own box, which it carries a copy of: the boundary
// replaces <Video> outright, so a crash costs the video, not chat or info.
export const VideoError = () => {
  return (
    <div className="aspect-video border-b">
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <AlertTriangle className="size-10 text-red-500" aria-hidden="true" />
        <p className="text-sm text-muted-foreground sm:text-base">
          The video could not load. Chat and stream info are unaffected.
        </p>
        <Button size="sm" variant="primary" onClick={() => window.location.reload()}>
          Refresh
        </Button>
      </div>
    </div>
  );
};
