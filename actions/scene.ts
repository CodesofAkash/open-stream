/**
 * Scene writes, and the one read the studio needs.
 *
 * Each write re-checks ownership through getSelf rather than trusting the id
 * it was handed - a server action is a public endpoint (AK-SEC-011) and a
 * scene id is guessable. Scenes are read here too, on demand: the provider is
 * mounted for every visitor, and reading them in a layout would put auth in
 * the root layout and opt every page out of static rendering.
 */

"use server";

import { z } from "zod";

import { getSelf } from "@/lib/auth-service";
import { db } from "@/lib/db";
import { getSelfScenes } from "@/lib/scene-service";
import { createStarterSources, sceneSourceSchema } from "@/lib/studio/scene";

/** Loaded on demand: a signed-out visitor has no scenes to read. */
const listScenes = async () => await getSelfScenes();

const saveSceneInput = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60),
  sources: z.array(sceneSourceSchema),
});

const saveScene = async (input: z.infer<typeof saveSceneInput>) => {
  const self = await getSelf();
  const { id, name, sources } = saveSceneInput.parse(input);

  const result = await db.scene.updateMany({
    where: { id, userId: self.id },
    data: { name, sources },
  });

  if (result.count === 0) throw new Error("Scene not found");

  return { id };
};

const createScene = async (name: string) => {
  const self = await getSelf();
  const parsed = z.string().trim().min(1).max(60).parse(name);

  const count = await db.scene.count({ where: { userId: self.id } });

  const scene = await db.scene.create({
    data: {
      name: parsed,
      position: count,
      userId: self.id,
      sources: createStarterSources(),
    },
  });

  return { id: scene.id };
};

const deleteScene = async (id: string) => {
  const self = await getSelf();

  // A streamer with no scenes has no studio, so the last one stays.
  const count = await db.scene.count({ where: { userId: self.id } });
  if (count <= 1) throw new Error("Your last scene cannot be deleted");

  await db.scene.deleteMany({ where: { id, userId: self.id } });

  return { id };
};

export { createScene, deleteScene, listScenes, saveScene };
