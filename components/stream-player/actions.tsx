"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, Radio, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { onFollow, onUnfollow } from "@/actions/follow";
import { useAuth } from "@clerk/nextjs";

interface ActionsProps {
  hostIdentity: string;
  hostName: string;
  isFollowing: boolean;
  isHost: boolean;
  isLive: boolean;
}

export const Actions = ({
  hostIdentity,
  hostName,
  isFollowing,
  isHost,
  isLive,
}: ActionsProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { userId } = useAuth();

  const handleFollow = () => {
    if (!userId) {
      return router.push("/sign-in");
    }

    startTransition(() => {
      onFollow(hostIdentity)
        .then((data) =>
          toast.success(`You are now following ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const handleUnfollow = () => {
    if (!userId) {
      return router.push("/sign-in");
    }

    startTransition(() => {
      onUnfollow(hostIdentity)
        .then((data) =>
          toast.success(`You have unfollowed ${data.following.username}`)
        )
        .catch(() => toast.error("Something went wrong"));
    });
  };

  const toggleFollow = () => {
    if (!isFollowing) {
      handleFollow();
    } else {
      handleUnfollow();
    }
  };

  // Nobody follows themselves, so a disabled Unfollow is wasted space on the
  // one screen where a streamer most wants to start streaming.
  if (isHost) {
    return (
      <Button
        asChild
        size="sm"
        variant={isLive ? "secondary" : "default"}
        className={isLive ? "w-full lg:w-auto" : "w-full bg-rose-600 text-white hover:bg-rose-700 lg:w-auto"}
      >
        <Link href={`/u/${hostName}/studio`}>
          {isLive ? (
            <SlidersHorizontal className="mr-2 size-4" aria-hidden="true" />
          ) : (
            <Radio className="mr-2 size-4" aria-hidden="true" />
          )}
          {isLive ? "Open Studio" : "Go live"}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      disabled={isPending}
      onClick={toggleFollow}
      variant="primary"
      size="sm"
      className="w-full lg:w-auto"
    >
      <Heart
        className={cn("h-4 w-4 mr-2", isFollowing ? "fill-white" : "fill-none")}
      />
      {isPending ? "Loading..." : isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export const ActionsSkeleton = () => {
  return <Skeleton className="h-10 w-full lg:w-24" />;
};