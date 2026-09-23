"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SearchFiltersProps {
  categories: Category[];
  currentCategory?: string | null;
  currentTag?: string | null;
  currentTerm?: string | null;
  liveOnly: boolean;
  sortBy: "viewers" | "recent";
  onCategoryChange: (categorySlug: string | null) => void;
  onTagSearch: (tag: string) => void;
  onClearTag: () => void;
  onClearAll: () => void;
  onLiveOnlyChange: (value: boolean) => void;
  onSortChange: (value: "viewers" | "recent") => void;
  isPending: boolean;
}

export const SearchFilters = ({
  categories,
  currentCategory,
  currentTag,
  currentTerm,
  liveOnly,
  sortBy,
  onCategoryChange,
  onTagSearch,
  onClearTag,
  onClearAll,
  onLiveOnlyChange,
  onSortChange,
  isPending,
}: SearchFiltersProps) => {
  const [tagInput, setTagInput] = useState("");

  const handleTagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim()) {
      onTagSearch(tagInput.trim());
      setTagInput("");
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Category Filter */}
        <Select
          value={currentCategory || "all"}
          onValueChange={(value) => onCategoryChange(value === "all" ? null : value)}
          disabled={isPending}
        >
          <SelectTrigger className="lg:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tag Search Input */}
        <form onSubmit={handleTagSearch} className="flex gap-2 lg:w-[250px]">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Search by tag..."
            disabled={isPending}
          />
          <Button type="submit" size="icon" aria-label="Search by tag" disabled={isPending || !tagInput.trim()}>
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(val: any) => onSortChange(val)}>
          <SelectTrigger className="lg:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewers">Most Viewers</SelectItem>
            <SelectItem value="recent">Recently Updated</SelectItem>
          </SelectContent>
        </Select>

        {/* Live Only */}
        <div className="flex items-center space-x-2">
          <Switch
            id="live-only"
            checked={liveOnly}
            onCheckedChange={onLiveOnlyChange}
          />
          <Label htmlFor="live-only" className="cursor-pointer">
            Live only
          </Label>
        </div>

        {/* Clear All Button */}
        {(currentTerm || currentTag || currentCategory) && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={isPending}
            className="gap-1"
          >
            Clear All
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {(currentTag || currentCategory || currentTerm) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {currentCategory && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onCategoryChange(null)}
              disabled={isPending}
              className="gap-1 h-7"
            >
              Category: {categories.find(c => c.slug === currentCategory)?.name}
              <X className="h-3 w-3" />
            </Button>
          )}

          {currentTag && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearTag}
              disabled={isPending}
              className="gap-1 h-7"
            >
              Tag: {currentTag}
              <X className="h-3 w-3" />
            </Button>
          )}

          {currentTerm && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearAll}
              disabled={isPending}
              className="gap-1 h-7"
            >
              Search: {currentTerm}
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};