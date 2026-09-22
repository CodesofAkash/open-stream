"use client"

import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import type { ColumnDef } from "@tanstack/react-table"
import type { CommunityTableFeatures } from "./table-features"
import { ArrowUpDown } from "lucide-react"
import UnblockButton from "./unblock-button"

export type BlockedUser = {
  id: string
  userId: string
  imageUrl: string,
  username: string,
  createdAt: string
}

// v9 parameterises ColumnDef by the feature set, so the columns know which
// behaviour (sorting, filtering) is actually available to them.
export const columns: ColumnDef<CommunityTableFeatures, BlockedUser, unknown>[] = [
  {
    accessorKey: "username",
    header: ({ column }) => (
      <Button
        variant={"ghost"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Username
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
    cell: ({row}) => (
      <div className="flex items-center gap-x-2">
        <UserAvatar
          username={row.original.username}
          imageUrl={row.original.imageUrl}
        />
        <span>{row.original.username}</span>
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant={"ghost"}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Blocked
        <ArrowUpDown className="ml-2 size-4" />
      </Button>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <UnblockButton userId={row.original.userId} />
  },
]