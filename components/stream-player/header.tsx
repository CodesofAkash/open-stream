"use client";

import {
  useParticipants,
  useRemoteParticipant,
} from "@livekit/components-react";
import { UserIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedMark } from "@/components/verified";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";
import { Actions, ActionsSkeleton } from "./actions";

interface HeaderProps {
  hostName: string;
  hostIdentity: string;
  viewerIdentity: string;
  imageUrl: string;
  isFollowing: boolean;
  name: string;
}

export const Header = ({
  hostName,
  hostIdentity,
  viewerIdentity,
  imageUrl,
  isFollowing,
  name,
}: HeaderProps) => {
  const participants = useParticipants();
  const participant = useRemoteParticipant(hostIdentity);

  const isLive = !!participant;
  const participantCount = participants.length - 1; // Exclude host

  const hostAsViewer = `host-${hostIdentity}`;
  const isHost = viewerIdentity === hostAsViewer;

  return (
    <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 items-start justify-between px-2 sm:px-4">
      <div className="flex items-center gap-x-3 w-full lg:w-auto">
        <UserAvatar
          imageUrl={imageUrl}
          username={hostName}
          size="lg"
          isLive={isLive}
          showBadge
        />
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-x-2">
            <h2 className="text-base sm:text-lg font-semibold truncate">
              {hostName}
            </h2>
            <VerifiedMark />
          </div>
          <p className="text-sm font-semibold truncate">{name}</p>
          {isLive && (
            <div className="flex items-center gap-x-1 text-xs text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <p>
                {participantCount} {participantCount === 1 ? "viewer" : "viewers"}
              </p>
            </div>
          )}
          {!isLive && (
            <p className="font-semibold text-xs text-muted-foreground">
              Offline
            </p>
          )}
        </div>
      </div>
      <Actions
        isFollowing={isFollowing}
        hostIdentity={hostIdentity}
        hostName={hostName}
        isHost={isHost}
        isLive={isLive}
      />
    </div>
  );
};

export const HeaderSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 items-start justify-between px-2 sm:px-4">
      <div className="flex items-center gap-x-2">
        <UserAvatarSkeleton size="lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <ActionsSkeleton />
    </div>
  );
};