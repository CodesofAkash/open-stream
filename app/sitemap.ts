import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { contentConfig } from "@/lib/content-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = contentConfig.project.baseUrl;

  // Get all users for dynamic routes
  const users = await db.user.findMany({
    select: {
      username: true,
      updatedAt: true,
    },
  });

  const userPages = users.map((user) => ({
    url: `${baseUrl}/${user.username}`,
    lastModified: user.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // The public marketing and legal pages. They were missing entirely, so the
  // only things Google was told about were the home page, search, and channels
  // — the /u/ dashboard is deliberately absent because it is private and
  // disallowed in robots.txt.
  const staticPages = ["/about", "/features", "/contact", "/privacy", "/terms"].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "/about" || path === "/features" ? 0.7 : 0.4,
    }),
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...staticPages,
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    ...userPages,
  ];
}