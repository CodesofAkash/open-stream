import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/store/use-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { LiveBadge } from "@/components/live-badge";

interface UserItemProps {
    username: string;
    imageUrl: string;
    isLive?: boolean;
}

export const UserItem = ({ username, imageUrl, isLive }: UserItemProps) => {

    const pathname = usePathname();

    const { collapsed } = useSidebar((state) => state);

    const href = `/${username}`;
    const isActive = pathname === href;

    return (
        <li className="list-none">
        <Button
        asChild
        variant="ghost"
        className={cn(
            "w-full h-12",
            collapsed ? "justify-center" : "justify-start",
            isActive && "bg-accent"
        )}
        >
            <Link href={href}>
                <div className={cn(
                    "flex items-center w-full gap-x-4",
                    collapsed && "justify-center",
                )}>
                    <UserAvatar
                        imageUrl={imageUrl}
                        username={username}
                        isLive={isLive}
                        showBadge={false}
                    />
                    {collapsed ? (
                        // Collapsed shows only the avatar, so the link would have
                        // no text for a screen reader to announce.
                        <span className="sr-only">{username}</span>
                    ) : (
                        <p className="truncate">
                            {username}
                        </p>
                    )}
                    {!collapsed && isLive && (
                        <LiveBadge className="ml-auto" />
                    )}
                </div>
            </Link>
        </Button>
        </li>
    )
}

export const UserItemSkeleton = () => {
    return (
        <li className="flex items-center gap-x-4 px-3 py-2">
            <Skeleton className="min-h-[32px] min-w-[32px] rounded-full" />
            <div className="flex-1">
                <Skeleton className="h-6" />
            </div>
        </li>
    )
}