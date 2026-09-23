/**
 * Reading a streamer's own scenes.
 *
 * A streamer with none gets one created rather than an empty studio: there is
 * nothing useful to do with zero scenes, and "add a scene before you can do
 * anything" is a worse first run than a working default.
 */

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { createStarterSources, parseSources, type Scene } from "@/lib/studio/scene";

/** Every scene belonging to the signed-in streamer, in their own order. */
const getSelfScenes = async (): Promise<Scene[]> => {
  const self = await getSelf();

  const rows = await db.scene.findMany({
    where: { userId: self.id },
    orderBy: { position: "asc" },
  });

  if (rows.length === 0) {
    const created = await db.scene.create({
      data: {
        name: "Main scene",
        position: 0,
        userId: self.id,
        sources: createStarterSources(),
      },
    });

    return [
      {
        id: created.id,
        name: created.name,
        position: created.position,
        sources: parseSources(created.sources),
      },
    ];
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    position: row.position,
    sources: parseSources(row.sources),
  }));
};

export { getSelfScenes };
