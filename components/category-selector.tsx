// components/category-selector.tsx - FIXED
"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Simplified category type - only what we need
interface SimpleCategory {
  id: string;
  name: string;
  isPredefined?: boolean;
}

interface CategorySelectorProps {
  categories: SimpleCategory[];
  value?: string;
  // The display name travels with the id so callers can show it without a
  // second lookup. Callers relied on this already; it was never passed.
  onChange: (categoryId: string, categoryName: string) => void;
}

export const CategorySelector = ({
  categories,
  value,
  onChange,
}: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedCategory = categories?.find((cat) => cat.id === value);
  
  // Filter categories based on search
  const filteredCategories = (categories || []).filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (categoryId: string) => {
    const category = categories?.find((cat) => cat.id === categoryId);
    onChange(categoryId, category?.name ?? categoryId);
    setOpen(false);
  };

  const handleCreateCustom = () => {
    if (search.trim()) {
      // Pass the name as ID for custom categories
      // The backend will create it if it doesn't exist
      // A custom category is identified by its own name.
      onChange(search.trim(), search.trim());
      setOpen(false);
      // Keep search to show what was selected until component re-renders
      setTimeout(() => setSearch(""), 100);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCategory ? selectedCategory.name : (value ? value : "Select category...")}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search category..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandGroup className="max-h-[300px] overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <div className="p-2">
                <p className="text-sm text-muted-foreground mb-2">
                  No category found.
                </p>
                {search.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleCreateCustom}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create &quot;{search}&quot;
                  </Button>
                )}
              </div>
            ) : (
              filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={() => handleSelect(category.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{category.name}</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
