// prisma/seed.ts - COMPLETE UPDATED SEED

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 needs a driver adapter and no longer reads .env itself, so a bare
// `new PrismaClient()` throws before the first query. Seeding writes a lot of
// rows, so it goes over the direct (non-pooled) connection when there is one.
config({ path: ".env", quiet: true });

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  }),
});

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.streamTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.category.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.block.deleteMany();
  await prisma.user.deleteMany();
  await prisma.suggestion.deleteMany();

  // Create Categories
  console.log("📁 Creating categories...");
  const categories = [
    {
      name: "Just Chatting",
      slug: "just-chatting",
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=800&fit=crop",
      description: "Casual conversations and hangouts",
      isPredefined: true,
    },
    {
      name: "Gaming",
      slug: "gaming",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=800&fit=crop",
      description: "General gaming content",
      isPredefined: true,
    },
    {
      name: "VALORANT",
      slug: "valorant",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=800&fit=crop",
      description: "Tactical FPS gameplay",
      isPredefined: true,
    },
    {
      name: "Counter-Strike",
      slug: "counter-strike",
      imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=800&fit=crop",
      description: "CS:GO and CS2 content",
      isPredefined: true,
    },
    {
      name: "League of Legends",
      slug: "league-of-legends",
      imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=800&fit=crop",
      description: "MOBA gameplay and strategy",
      isPredefined: true,
    },
    {
      name: "Minecraft",
      slug: "minecraft",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=800&fit=crop",
      description: "Building, survival, and creativity",
      isPredefined: true,
    },
    {
      name: "Art",
      slug: "art",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=800&fit=crop",
      description: "Digital art, drawing, and design",
      isPredefined: true,
    },
    {
      name: "Music",
      slug: "music",
      imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=800&fit=crop",
      description: "Live performances and music production",
      isPredefined: true,
    },
    {
      name: "Cooking",
      slug: "cooking",
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=800&fit=crop",
      description: "Culinary streams and recipes",
      isPredefined: true,
    },
    {
      name: "Fitness & Health",
      slug: "fitness-health",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=800&fit=crop",
      description: "Workouts and wellness",
      isPredefined: true,
    },
    {
      name: "Travel & Outdoors",
      slug: "travel-outdoors",
      imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=800&fit=crop",
      description: "Adventure and exploration",
      isPredefined: true,
    },
    {
      name: "Programming",
      slug: "programming",
      imageUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=800&fit=crop",
      description: "Coding, tutorials, and tech",
      isPredefined: true,
    },
    {
      name: "Horror",
      slug: "horror",
      imageUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&h=800&fit=crop",
      description: "Scary games and content",
      isPredefined: true,
    },
    {
      name: "Retro Gaming",
      slug: "retro-gaming",
      imageUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=600&h=800&fit=crop",
      description: "Classic games and nostalgia",
      isPredefined: true,
    },
    {
      name: "Strategy",
      slug: "strategy",
      imageUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=600&h=800&fit=crop",
      description: "RTS, turn-based, and tactical games",
      isPredefined: true,
    },
    {
      name: "Anime & Manga",
      slug: "anime-manga",
      imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=450&fit=crop",
      description: "Discussion and art inspired by anime",
      isPredefined: true,
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories[category.slug] = created;
    console.log(`  ✅ ${category.name}`);
  }

  // Create Tags
  console.log("🏷️  Creating tags...");
  const tags = [
    "English",
    "Competitive",
    "Casual",
    "Tutorial",
    "Speedrun",
    "First Playthrough",
    "Funny",
    "Educational",
    "Relaxing",
    "High Skill",
    "Beginner Friendly",
    "Pro Player",
    "Ranked",
    "Unranked",
    "Co-op",
    "Multiplayer",
    "Single Player",
    "Creative",
    "Building",
    "PvP",
  ];

  const createdTags: Record<string, any> = {};
  for (const tagName of tags) {
    const tag = await prisma.tag.create({
      data: {
        name: tagName,
        slug: tagName.toLowerCase().replace(/\s+/g, "-"),
      },
    });
    createdTags[tagName] = tag;
  }
  console.log(`  ✅ Created ${tags.length} tags`);

  // Create Users and Streams
  console.log("👥 Creating users and streams...");

  const streamers = [
    // LIVE STREAMS (5)
    {
      username: "ShadowNinja92",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ShadowNinja92",
      externalUserId: "user_shadow_ninja_92",
      bio: "Competitive VALORANT player | Radiant rank",
      stream: {
        name: "RANKED GRIND - Road to Immortal 🔥",
        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
        isLive: true,
        viewerCount: 1247,
        peakViewerCount: 1589,
        categorySlug: "valorant",
        tags: ["English", "Competitive", "Ranked", "Pro Player"],
      },
    },
    {
      username: "CodeWithSarah",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeWithSarah",
      externalUserId: "user_code_with_sarah",
      bio: "Full-stack developer | Teaching web development",
      stream: {
        name: "Building a Real-Time Chat App with Next.js",
        thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop",
        isLive: true,
        viewerCount: 892,
        peakViewerCount: 1124,
        categorySlug: "programming",
        tags: ["English", "Tutorial", "Educational", "Beginner Friendly"],
      },
    },
    {
      username: "MinecraftMaster",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MinecraftMaster",
      externalUserId: "user_minecraft_master",
      bio: "Building epic cities in Minecraft",
      stream: {
        name: "Mega City Build Day 47 - Building the Stadium",
        thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop",
        isLive: true,
        viewerCount: 2341,
        peakViewerCount: 2876,
        categorySlug: "minecraft",
        tags: ["English", "Creative", "Building", "Relaxing"],
      },
    },
    {
      username: "ChefTommy",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ChefTommy",
      externalUserId: "user_chef_tommy",
      bio: "Professional chef | Cooking delicious meals live",
      stream: {
        name: "Making Authentic Italian Pasta from Scratch",
        thumbnailUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=450&fit=crop",
        isLive: true,
        viewerCount: 567,
        peakViewerCount: 734,
        categorySlug: "cooking",
        tags: ["English", "Educational", "Relaxing"],
      },
    },
    {
      username: "HorrorGirl",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HorrorGirl",
      externalUserId: "user_horror_girl",
      bio: "Surviving the scariest games | Jump scare queen 👻",
      stream: {
        name: "First Time Playing Resident Evil 4 Remake",
        thumbnailUrl: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&h=450&fit=crop",
        isLive: true,
        viewerCount: 1834,
        peakViewerCount: 2103,
        categorySlug: "horror",
        tags: ["English", "First Playthrough", "Funny"],
      },
    },

    // OFFLINE STREAMS (11)
    {
      username: "LeagueProMax",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LeagueProMax",
      externalUserId: "user_league_pro_max",
      bio: "Ex-pro League player | Challenger coaching",
      stream: {
        name: "Challenger ADC Guide - How to Carry",
        thumbnailUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "league-of-legends",
        tags: ["English", "Educational", "Pro Player", "High Skill"],
      },
    },
    {
      username: "ArtistEmily",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArtistEmily",
      externalUserId: "user_artist_emily",
      bio: "Digital artist | Character design specialist",
      stream: {
        name: "Painting Fantasy Characters - Taking Requests",
        thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "art",
        tags: ["English", "Relaxing", "Creative"],
      },
    },
    {
      username: "GuitarHero88",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuitarHero88",
      externalUserId: "user_guitar_hero_88",
      bio: "Live music performances | Rock and blues",
      stream: {
        name: "Sunday Jam Session - Requests Welcome!",
        thumbnailUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "music",
        tags: ["English", "Relaxing", "Creative"],
      },
    },
    {
      username: "FitnessCoachMike",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=FitnessCoachMike",
      externalUserId: "user_fitness_coach_mike",
      bio: "Personal trainer | Home workout specialist",
      stream: {
        name: "30-Minute Full Body HIIT Workout",
        thumbnailUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "fitness-health",
        tags: ["English", "Educational", "Beginner Friendly"],
      },
    },
    {
      username: "RetroGamer64",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=RetroGamer64",
      externalUserId: "user_retro_gamer_64",
      bio: "Speedrunning classic games since 2015",
      stream: {
        name: "Super Mario 64 120 Star Speedrun Attempts",
        thumbnailUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "retro-gaming",
        tags: ["English", "Speedrun", "High Skill"],
      },
    },
    {
      username: "StrategyKing",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=StrategyKing",
      externalUserId: "user_strategy_king",
      bio: "RTS expert | Starcraft II Grand Master",
      stream: {
        name: "Starcraft II Ladder - Protoss Builds",
        thumbnailUrl: "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "strategy",
        tags: ["English", "Competitive", "High Skill"],
      },
    },
    {
      username: "CasualGamerJoe",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CasualGamerJoe",
      externalUserId: "user_casual_gamer_joe",
      bio: "Just here to have fun and chill",
      stream: {
        name: "Trying Out New Indie Games",
        thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "gaming",
        tags: ["English", "Casual", "Funny", "Relaxing"],
      },
    },
    {
      username: "TravelVlogger",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=TravelVlogger",
      externalUserId: "user_travel_vlogger",
      bio: "Exploring the world one stream at a time",
      stream: {
        name: "Hiking in the Swiss Alps - Q&A",
        thumbnailUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "travel-outdoors",
        tags: ["English", "Relaxing", "Educational"],
      },
    },
    {
      username: "AnimeExpert",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimeExpert",
      externalUserId: "user_anime_expert",
      bio: "Anime reviews, discussions, and fan art",
      stream: {
        name: "Drawing My Hero Academia Characters",
        thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "anime-manga",
        tags: ["English", "Creative", "Relaxing"],
      },
    },
    {
      username: "CSGOPro",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CSGOPro",
      externalUserId: "user_csgo_pro",
      bio: "Former pro CS player | Global Elite",
      stream: {
        name: "10 Man Competitive Practice",
        thumbnailUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "counter-strike",
        tags: ["English", "Competitive", "Pro Player", "High Skill"],
      },
    },
    {
      username: "JustChattingBob",
      imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=JustChattingBob",
      externalUserId: "user_just_chatting_bob",
      bio: "Variety streamer | Let's hang out!",
      stream: {
        name: "Morning Coffee and Conversation ☕",
        thumbnailUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=450&fit=crop",
        isLive: false,
        categorySlug: "just-chatting",
        tags: ["English", "Casual", "Relaxing"],
      },
    },
  ];

  for (const streamer of streamers) {
    const user = await prisma.user.create({
      data: {
        username: streamer.username,
        imageUrl: streamer.imageUrl,
        externalUserId: streamer.externalUserId,
        bio: streamer.bio,
      },
    });

    const category = createdCategories[streamer.stream.categorySlug];

    const stream = await prisma.stream.create({
      data: {
        name: streamer.stream.name,
        thumbnailUrl: streamer.stream.thumbnailUrl,
        isLive: streamer.stream.isLive,
        viewerCount: streamer.stream.viewerCount || 0,
        peakViewerCount: streamer.stream.peakViewerCount || 0,
        userId: user.id,
        categoryId: category.id,
        streamStartedAt: streamer.stream.isLive ? new Date() : null,
      },
    });

    // Add tags
    if (streamer.stream.tags) {
      for (const tagName of streamer.stream.tags) {
        const tag = createdTags[tagName];
        if (tag) {
          await prisma.streamTag.create({
            data: {
              streamId: stream.id,
              tagId: tag.id,
            },
          });
        }
      }
    }

    console.log(`  ✅ ${streamer.username} ${streamer.stream.isLive ? "(LIVE)" : ""}`);
  }

  // Create some follow relationships
  console.log("👥 Creating follow relationships...");
  const allUsers = await prisma.user.findMany();
  if (allUsers.length >= 4) {
    await prisma.follow.create({
      data: {
        followerId: allUsers[0].id,
        followingId: allUsers[1].id,
      },
    });
    await prisma.follow.create({
      data: {
        followerId: allUsers[0].id,
        followingId: allUsers[2].id,
      },
    });
    await prisma.follow.create({
      data: {
        followerId: allUsers[1].id,
        followingId: allUsers[3].id,
      },
    });
    console.log("  ✅ Created follow relationships");
  }

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${tags.length} tags`);
  console.log(`   - ${streamers.length} users and streams`);
  console.log(`   - ${streamers.filter((s) => s.stream.isLive).length} live streams`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });