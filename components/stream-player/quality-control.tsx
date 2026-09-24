/**
 * Lets a viewer ask for a smaller picture than the one being sent.
 *
 * It appears only when the streamer publishes more than one size: a single
 * layer is all there is to choose from, and a control that silently does
 * nothing is worse than none. Asking for less is worth having on a phone.
 */

"use client";

import { useState } from "react";
import { RemoteTrackPublication, VideoQuality } from "livekit-client";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: String(VideoQuality.HIGH), label: "High" },
  { value: String(VideoQuality.MEDIUM), label: "Medium" },
  { value: String(VideoQuality.LOW), label: "Low" },
];

interface QualityControlProps {
  publication?: RemoteTrackPublication;
}

const QualityControl = ({ publication }: QualityControlProps) => {
  const [value, setValue] = useState("auto");

  if (!publication?.simulcasted) {
    return null;
  }

  const onChange = (next: string) => {
    setValue(next);

    // Auto hands the decision back to the client's own adaptive logic.
    if (next === "auto") {
      publication.setVideoQuality(VideoQuality.HIGH);
      return;
    }

    publication.setVideoQuality(Number(next) as VideoQuality);
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          aria-label="Video quality"
        >
          <Settings2 className="mr-2 size-4" aria-hidden="true" />
          <SelectValue />
        </Button>
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { QualityControl };
