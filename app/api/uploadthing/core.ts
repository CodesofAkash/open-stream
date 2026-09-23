import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  thumbnailUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const self = await getSelf();
      return { user: self };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.stream.update({
        where: {
          userId: metadata.user.id,
        },
        data: {
          thumbnailUrl: file.url,
        },
      });

      return { fileUrl: file.url };
    }),

  // Overlays a streamer drops into a scene — a logo, a donation QR, an alert
  // card. Nothing is written to the database: the scene stores the URL.
  sceneImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const self = await getSelf();
      return { user: self };
    })
    .onUploadComplete(async ({ file }) => {
      return { fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;