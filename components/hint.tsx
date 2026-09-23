import { cloneElement, isValidElement, type ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HintProps {
  label: string;
  children: React.ReactNode;
  asChild?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export const Hint = ({
  label,
  children,
  asChild,
  side,
  align,
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        {/*
          A tooltip is a visual hint, not an accessible name: a screen reader
          announces an icon-only trigger as just "button". Every icon control in
          the app is wrapped in Hint, so labelling the child here fixes all of
          them at once. An explicit aria-label on the child still wins.
        */}
        <TooltipTrigger asChild={asChild}>
          {isValidElement(children)
            ? cloneElement(children as ReactElement<{ "aria-label"?: string }>, {
                "aria-label":
                  (children as ReactElement<{ "aria-label"?: string }>).props["aria-label"] ??
                  label,
              })
            : children}
        </TooltipTrigger>
        <TooltipContent
          className="text-black bg-white"
          side={side}
          align={align}
        >
          <p className="font-semibold">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};