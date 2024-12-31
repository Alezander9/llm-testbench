import React, { useState } from "react";
import { useQuery } from "convex/react";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Button } from "../../ui/button";
import { IconButton } from "../../ui/icon-button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../ui/context-menu";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { cn } from "../../../lib/utils";

interface TestCaseSelectorProps {
  value?: Id<"testCases">;
  onValueChange: (value: Id<"testCases">) => void;
  userId: Id<"users">;
}

const TestCaseItem = ({
  testCase,
  onSelect,
  onEdit,
}: {
  testCase: { _id: Id<"testCases">; name: string };
  onSelect: () => void;
  onEdit: () => void;
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
          <span className="truncate flex-1 min-w-0 text-sm">
            {testCase.name}
          </span>
          {showActions && (
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
      <ContextMenuContent
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <ContextMenuItem onSelect={onEdit}>Edit</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const TestCaseSelector = ({
  value,
  onValueChange,
  userId,
}: TestCaseSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const testCases = useQuery(api.queries.getUserTestCases, {
    userId,
  });

  const userState = useQuery(api.queries.getUserState, {
    userId,
  });

  const selectedTestCase = testCases?.find(
    (testCase) => testCase._id === value
  );

  const filteredTestCases = React.useMemo(() => {
    if (!testCases) return [];

    // If there's a search term, show all matching test cases
    if (search) {
      return testCases.filter((testCase) =>
        testCase.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // If no search term, show all test cases except those in recent
    const recentIds = new Set(userState?.recentTestCaseIds || []);
    return testCases.filter((testCase) => !recentIds.has(testCase._id));
  }, [testCases, search, userState?.recentTestCaseIds]);

  const recentTestCases = React.useMemo(() => {
    if (!testCases || !userState?.recentTestCaseIds) return [];
    return userState.recentTestCaseIds
      .map((id) => testCases.find((tc) => tc._id === id))
      .filter((tc): tc is NonNullable<typeof tc> => tc !== undefined);
  }, [testCases, userState]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleSelect = (testCaseId: Id<"testCases">) => {
    onValueChange(testCaseId);
    setOpen(false);
  };

  const handleEdit = (testCaseId: Id<"testCases">) => {
    window.location.hash = `edit-test-case/${testCaseId}`;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          role="combobox"
          aria-expanded={open}
          className="w-[220px] justify-between"
        >
          {selectedTestCase?.name ?? "Select test case..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[220px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput
            placeholder="Search test cases..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No test cases found.</CommandEmpty>

            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  window.location.hash = "make-test-case";
                }}
                className="flex items-center h-10 rounded-md transition-colors px-2 hover:bg-primary/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm">Create new test case</span>
              </CommandItem>
            </CommandGroup>

            {/* Only show Recent group when there's no search term */}
            {!search && recentTestCases.length > 0 && (
              <CommandGroup heading="Recent">
                {recentTestCases.map((testCase) => (
                  <TestCaseItem
                    key={testCase._id}
                    testCase={testCase}
                    onSelect={() => handleSelect(testCase._id)}
                    onEdit={() => handleEdit(testCase._id)}
                  />
                ))}
              </CommandGroup>
            )}

            {/* Show filtered results with appropriate heading */}
            {filteredTestCases.length > 0 && (
              <CommandGroup
                heading={search ? "Search results" : "All test cases"}
              >
                {filteredTestCases.map((testCase) => (
                  <TestCaseItem
                    key={testCase._id}
                    testCase={testCase}
                    onSelect={() => handleSelect(testCase._id)}
                    onEdit={() => handleEdit(testCase._id)}
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
