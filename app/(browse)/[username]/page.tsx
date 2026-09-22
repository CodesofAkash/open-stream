import { notFound } from "next/navigation";
import { getUserByUsername } from "@/lib/user-service";
import { isFollowingUser } from "@/lib/follow-service";
import { isBlockedByUser } from "@/lib/block-service";
import { LazyStreamPlayer } from "@/components/stream-player/lazy-stream-player";
import { db } from "@/lib/db";
import { getAllCategories } from "@/lib/category-service";
import { contentConfig } from "@/lib/content-config";

import { Suspense } from "react";
import { StreamPlayerSkeleton } from "@/components/stream-player";
import { StreamPlayerErrorBoundary } from "@/components/stream-player/error-boundary";

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

const UserPage = async ({ params }: UserPageProps) => {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user || !user.stream) {
    notFound();
  }

  // Fetch stream with category and tags
  const streamWithDetails = await db.stream.findUnique({
    where: { id: user.stream.id },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              name: true,
            },
          },
        },
        take: 5,
      },
    },
  });

  const isFollowing = await isFollowingUser(user.id);
  const isBlocked = await isBlockedByUser(user.id);

  if (isBlocked) {
    notFound();
  }

  // Fetch all categories for the selector
  const categories = await getAllCategories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: user.stream?.name || `${user.username}'s Stream`,
    description: user.bio || `Live stream by ${user.username}`,
    thumbnailUrl: user.stream?.thumbnailUrl || user.imageUrl,
    uploadDate: user.stream?.createdAt?.toISOString(),
    contentUrl: `${contentConfig.project.baseUrl}/${user.username}`,
    embedUrl: `${contentConfig.project.baseUrl}/${user.username}`,
    isLiveBroadcast: user.stream?.isLive,
  };

  return (
    <StreamPlayerErrorBoundary>
      <Suspense fallback={<StreamPlayerSkeleton />}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LazyStreamPlayer
          user={{
            ...user,
            _count: {
              followers: user._count.followers,
            },
          }}
          stream={{
            ...user.stream,
            ...streamWithDetails,
          }}
          isFollowing={isFollowing}
          streamWithCategoryAndTags={streamWithDetails}
          categories={categories}
        />
      </Suspense>
    </StreamPlayerErrorBoundary>
    
  );
};

export default UserPage;



import { Metadata } from "next";

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);

  // notFound() here, not a "User Not Found" title. generateMetadata runs
  // BEFORE the streaming shell is flushed; the (browse) layout wraps its
  // sidebar in <Suspense>, so once the shell goes out the status is already
  // 200 and the page body's own notFound() can no longer change it. The
  // visitor saw 404 copy while crawlers were told the page exists, and soft
  // 404s get indexed.
  if (!user || !user.stream) {
    notFound();
  }

  return {
    title: `${user.username} - Live on OpenStream`,
    description: user.bio || `Watch ${user.username}'s live stream`,
    openGraph: {
      title: `${user.username} - Live Stream`,
      description: user.bio || `Watch ${user.username} live`,
      images: [
        {
          url: user.stream?.thumbnailUrl || user.imageUrl,
          width: 1200,
          height: 630,
          alt: `${user.username} stream thumbnail`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.username} - Live Stream`,
      description: user.bio || `Watch ${user.username} live`,
      images: [user.stream?.thumbnailUrl || user.imageUrl],
    },
  };
}