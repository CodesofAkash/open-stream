import { MetadataRoute } from "next";
import { contentConfig } from "@/lib/content-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /u/ is the private creator dashboard, /studio is the CMS.
        disallow: ["/u/", "/api/", "/sign-in", "/sign-up", "/studio"],
      },
    ],
    sitemap: `${contentConfig.project.baseUrl}/sitemap.xml`,
  };
}