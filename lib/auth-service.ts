import { currentUser } from "@clerk/nextjs/server";

import { db } from "./db";

/**
 * The signed-in user's row, created on demand if it is missing.
 *
 * Accounts are normally created by the Clerk webhook on user.created. That is
 * a single point of failure: the webhook only ever fires once, so if it was
 * misconfigured, or the deployment was down, or the database was replaced
 * underneath an existing Clerk account, the person ends up permanently signed
 * in with no channel and every dashboard page throwing "Not found" — with no
 * way to recover short of deleting their Clerk account.
 *
 * Creating the row here when it is absent makes the webhook an optimisation
 * rather than a requirement, and the write is idempotent, so a webhook landing
 * at the same moment cannot produce a duplicate.
 */
export const getSelf = async () => {
    const self = await currentUser();
    if (!self || !self.username) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {externalUserId: self.id},
    });

    if (user) {
        return user;
    }

    return db.user.create({
        data: {
            externalUserId: self.id,
            username: self.username,
            imageUrl: self.imageUrl,
            stream: {
                create: {
                    name: `${self.username}'s stream`,
                },
            },
        },
    });
}

export const getSelfByUsername = async (username: string) => {
    const self = await currentUser();

    if (!self || !self.username) {
        throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
        where: {username},
        include: {
            stream: true, // ADD THIS LINE
        },
    });

    if (!user) {
        throw new Error("User Not found");
    }

    if(self.username !== user.username) {
        throw new Error("Unauthorized");
    }

    return user;
}