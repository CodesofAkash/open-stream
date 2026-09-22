"use client";

import { useSidebar } from "@/store/use-sidebar";
import type { getRecommended } from "@/lib/recommended-service";
import { UserItem, UserItemSkeleton } from "./user-item";

// Derived from the query rather than declared as a full User: getRecommended
// selects four fields, so claiming the whole model here was a lie the build
// could not catch while typescript.ignoreBuildErrors was on.
type RecommendedUser = Awaited<ReturnType<typeof getRecommended>>[number];

interface RecommendedProps {
    data: RecommendedUser[];
}

export const Recommended = ({data}: RecommendedProps) => {

    const { collapsed } = useSidebar((state) => state);

    const showLabel = !collapsed && data.length > 0;

    // Limit to 7 items
    const displayData = data.slice(0, 7);

    return (
        <div>
            {showLabel && (
                <div className="pl-6 mb-4">
                    <p className="text-sm text-muted-foreground">
                        Recommended
                    </p>
                </div>
            )}
            <ul className="space-y-2 px-2 max-h-[400px] overflow-y-auto">
                {displayData.map((user) => (
                    <UserItem key={user.id} username={user.username} imageUrl={user.imageUrl} isLive={user.stream?.isLive} />
                ))}
            </ul>
        </div>
    )
}

export const RecommendedSkeleton = () => {
    return (
        <ul className="px-2">
            {[...Array(3)].map((_, i) => (
                <UserItemSkeleton key={i} />
            ))}
        </ul>
    )
};