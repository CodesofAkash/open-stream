import Link from "next/link";
import { User } from "@prisma/client";
import { Thumbnail, ThumbnailSkeleton } from "@/components/thumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";

interface ResultCardProps {
  data: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    isLive: boolean;
    user: User;
    viewerCount: number;
    categoryName: string | null;
    categorySlug: string | null;
    tagNames: string[];
  };
}

export const ResultCard = ({ data }: ResultCardProps) => {
  return (
    <div className="w-full space-y-3 group">
      {/* Main Link - Only wraps thumbnail and user info */}
      <Link href={`/${data.user.username}`}>
        <Thumbnail
          src={data.thumbnailUrl}
          fallback={data.user.imageUrl}
          isLive={data.isLive}
          username={data.user.username}
        />
      </Link>

      <div className="flex gap-x-3 mt-2">
        <Link href={`/${data.user.username}`}>
          <UserAvatar
            username={data.user.username}
            imageUrl={data.user.imageUrl}
            isLive={data.isLive}
          />
        </Link>

        <div className="flex flex-col text-sm overflow-hidden flex-1">
          <Link href={`/${data.user.username}`}>
            <p className="truncate font-semibold hover:text-primary transition">
              {data.name}
            </p>
          </Link>

          <p className="text-muted-foreground text-sm">{data.user.username}</p>

          {data.categoryName && (
            <p className="text-xs text-muted-foreground truncate">
              {data.categoryName}
            </p>
          )}

          {data.isLive && data.viewerCount > 0 && (
            <p className="text-xs text-red-400 font-medium">
              {data.viewerCount.toLocaleString()} viewers
            </p>
          )}

          {/* CLICKABLE TAGS - No longer nested in Link */}
          {data.tagNames && data.tagNames.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {data.tagNames.slice(0, 2).map((tag) => (
                <Link
                  key={tag}
                  href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded hover:bg-accent/80 transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ResultCardSkeleton = () => {
  return (
    <div className="w-full space-y-3">
      <ThumbnailSkeleton />
      <div className="flex gap-x-3">
        <UserAvatarSkeleton />
        <div className="flex flex-col gap-y-1 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
};