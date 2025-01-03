// Resuable search selector component for selecting an agent or test case
import React, { useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { IconButton } from "./icon-button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "../../lib/utils";

interface Item {
  _id: Id<any>;
  name: string;
}

interface SearchSelectorProps<T extends Item> {
  value?: T["_id"];
  onValueChange: (value: T["_id"]) => void;
  items?: T[];
  recentIds?: T["_id"][];
  placeholder?: string;
  createNewText?: string;
  onCreateNew?: () => void;
  onEdit?: (id: T["_id"]) => void;
  variant?: "agent" | "testcase";
}

// Modify the TestCaseItem to be a generic ItemRow
const ItemRow = <T extends Item>({
  item,
  onSelect,
  onEdit,
}: {
  item: T;
  onSelect: () => void;
  onEdit?: () => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleMoreButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const contextMenuEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: e.clientX,
      clientY: e.clientY,
    });
    e.currentTarget.dispatchEvent(contextMenuEvent);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">
        <CommandItem
          onSelect={onSelect}
          className={cn(
            "flex items-center h-10 rounded-md transition-colors relative w-full px-2",
            "hover:bg-primary/50 cursor-pointer"
          )}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <span className="truncate flex-1 min-w-0 text-sm">{item.name}</span>
          {showActions && onEdit && (
            <IconButton
              variant="ghost"
              className="h-6 w-6 p-0 flex-shrink-0 relative z-10"
              onClick={handleMoreButtonClick}
            >
              <MoreHorizontal className="h-4 w-4" />
            </IconButton>
          )}
        </CommandItem>
      </ContextMenuTrigger>
      {onEdit && (
        <ContextMenuContent
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <ContextMenuItem onSelect={() => onEdit()}>Edit</ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
};

export const SearchSelector = <T extends Item>({
  value,
  onValueChange,
  items = [],
  recentIds = [],
  placeholder = "Select item...",
  createNewText = "Create new",
  onCreateNew,
  onEdit,
  variant = "testcase",
}: SearchSelectorProps<T>) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState<string>("");

  const selectedItem = items?.find((item) => item._id === value);

  const filteredItems = React.useMemo(() => {
    if (!items) return [];

    // If there's a search term, show all matching items
    if (search) {
      return items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // If no search term, show all items except those in recent
    const recentIdsSet = new Set(recentIds);
    return items.filter((item) => !recentIdsSet.has(item._id));
  }, [items, search, recentIds]);

  const recentItems = React.useMemo(() => {
    if (!items || !recentIds?.length) return [];
    return recentIds
      .map((id) => items.find((item) => item._id === id))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);
  }, [items, recentIds]);

  const renderTrigger = () => {
    // The trigger for the agent search is secretly a larger bar so that the popover is centered in the sidebar
    if (variant === "agent") {
      return (
        <div
          role="combobox"
          aria-expanded={open}
          className="inline-flex items-center gap-2 w-full justify-end"
        >
          <IconButton variant="ghost">
            <Search style={{ width: "24px", height: "24px" }} />
          </IconButton>
        </div>
      );
    }

    return (
      <Button
        variant="secondary"
        role="combobox"
        aria-expanded={open}
        className="w-[220px] justify-between"
      >
        {selectedItem?.name ?? placeholder}
      </Button>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
      <PopoverContent
        className="w-[220px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>

            {onCreateNew && (
              <CommandGroup>
                <CommandItem
                  onSelect={onCreateNew}
                  className="flex items-center h-10 rounded-md transition-colors px-2 hover:bg-primary/50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="text-sm">{createNewText}</span>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Only show Recent group when there's no search term */}
            {!search && recentItems.length > 0 && (
              <CommandGroup heading="Recent">
                {recentItems.map((item) => (
                  <ItemRow
                    key={item._id}
                    item={item}
                    onSelect={() => {
                      onValueChange(item._id);
                      setOpen(false);
                    }}
                    onEdit={onEdit ? () => onEdit(item._id) : undefined}
                  />
                ))}
              </CommandGroup>
            )}

            {/* Show filtered results with appropriate heading */}
            {filteredItems.length > 0 && (
              <CommandGroup heading={search ? "Search results" : "All items"}>
                {filteredItems.map((item) => (
                  <ItemRow
                    key={item._id}
                    item={item}
                    onSelect={() => {
                      onValueChange(item._id);
                      setOpen(false);
                    }}
                    onEdit={onEdit ? () => onEdit(item._id) : undefined}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
