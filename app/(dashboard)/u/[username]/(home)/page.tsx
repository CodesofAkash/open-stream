import { StreamPlayer } from "@/components/stream-player";
import { getUserByUsername } from "@/lib/user-service";
import { currentUser } from "@clerk/nextjs/server";
import { getAllCategories } from "@/lib/category-service";
import { db } from "@/lib/db";

interface CreatorPageProps {
  params: Promise<{
    username: string;
  }>;
}

const CreatorPage = async ({ params }: CreatorPageProps) => {
  const externalUser = await currentUser();
  const { username } = await params;

  // Get user with stream
  const user = await getUserByUsername(username);

  if (!user || user.externalUserId !== externalUser?.id || !user.stream) {
    throw new Error("Unauthorized");
  }

  // Fetch stream with category and tags
  const streamWithCategoryAndTags = await db.stream.findUnique({
    where: { userId: user.id },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Fetch all categories - THIS NOW RETURNS FULL CATEGORY OBJECTS
  const categories = await getAllCategories();

  if (!streamWithCategoryAndTags) {
    throw new Error("Stream not found");
  }

  // Map to simplified format for props
  const simplifiedCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    isPredefined: cat.isPredefined,
  }));

  return (
    <div className="h-full">
      <StreamPlayer
        user={user}
        stream={user.stream}
        categories={simplifiedCategories}
        streamWithCategoryAndTags={streamWithCategoryAndTags}
        isFollowing
      />
    </div>
  );
};

export default CreatorPage;
