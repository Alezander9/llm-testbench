import { useQuery, useMutation } from "convex/react";
import { useDashboardStore } from "../../../stores/dashboard";
import { cn } from "../../../lib/utils";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  MoreHorizontal,
} from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";
import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  UniqueIdentifier,
  DraggableAttributes,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "../../ui/context-menu";
import { ScrollArea } from "../../ui/scroll-area";
import { IconButton } from "../../ui/icon-button";
import { Id } from "../../../../convex/_generated/dataModel";
import { TreeItemType } from "./types";
import { Input } from "../../ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";

type DragHandleListeners = {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onPointerDown?: (event: React.PointerEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
};

type TreeItemProps = {
  label: string;
  isFolder: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  depth?: number;
  id: string;
  score?: number;
  parentFolderId?: Id<"agentFolders"> | null;
  dragHandleProps?: {
    attributes?: DraggableAttributes;
    listeners?: DragHandleListeners;
  };
  type?: "folder" | "agent";
};

type DraggableTreeItemProps = TreeItemProps & {
  id: string;
};

class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: (event: { nativeEvent: globalThis.PointerEvent }) => {
        const nativeEvent = event.nativeEvent;

        if (
          !nativeEvent.isPrimary ||
          nativeEvent.button !== 0 ||
          (nativeEvent.target as Element).closest('[data-no-dnd="true"]') ||
          isInteractiveElement(nativeEvent.target as Element)
        ) {
          return false;
        }
        return true;
      },
    },
  ];
}

const isInteractiveElement = (element: Element | null) => {
  const interactiveElements = [
    "button",
    "input",
    "textarea",
    "select",
    "option",
  ];
  return (
    element?.tagName &&
    interactiveElements.includes(element.tagName.toLowerCase())
  );
};

const DraggableTreeItem = ({
  id,
  type,
  isRenaming,
  ...props
}: DraggableTreeItemProps & {
  type: "folder" | "agent";
  isRenaming?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { type },
    disabled: isRenaming,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn("transition-opacity w-full", isDragging && "opacity-50")}
    >
      <div className="flex relative w-full">
        <TreeItem
          id={id}
          type={type}
          {...props}
          dragHandleProps={isRenaming ? undefined : { attributes, listeners }}
        />
      </div>
    </div>
  );
};

const DroppableFolder = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef} className="transition-colors duration-200">
      {children}
    </div>
  );
};

const TreeItem = ({
  label,
  isFolder,
  isExpanded,
  onToggle,
  onSelect,
  isSelected,
  depth = 0,
  id,
  score,
  parentFolderId,
  dragHandleProps,
  type,
}: TreeItemProps) => {
  const [showActions, setShowActions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(label);
  const renameFolder = useMutation(api.mutations.renameFolder);
  const renameAgent = useMutation(api.mutations.renameAgent);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentUser = useGetUser();
  const createNewFolder = useMutation(api.mutations.createFolder);
  const deleteFolder = useMutation(api.mutations.deleteFolder);
  const deleteAgent = useMutation(api.mutations.deleteAgent);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Focus input when entering rename mode
  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  const handleRename = async () => {
    if (newName.trim()) {
      if (isFolder) {
        await renameFolder({
          folderId: id as Id<"agentFolders">,
          newName: newName.trim(),
        });
      } else {
        await renameAgent({
          agentId: id as Id<"agents">,
          newName: newName.trim(),
        });
      }
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewName(label);
      setIsRenaming(false);
    }
  };

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

  const handleDelete = async () => {
    if (!isFolder) {
      await deleteAgent({
        agentId: id as Id<"agents">,
      });
    }
    setShowDeleteDialog(false);
  };

  const handleContextMenuItemSelect = (action: string) => () => {
    switch (action) {
      case "new-agent":
        window.location.hash = "make-agent";
        break;
      case "new-folder":
        const newFolderParentId = isFolder ? id : parentFolderId;
        if (currentUser) {
          createNewFolder({
            userId: currentUser._id,
            name: "New Folder",
            parentFolderId: newFolderParentId as Id<"agentFolders">,
          });
        }
        break;
      case "view":
        window.location.hash = `view-agent/${id}`;
        break;
      case "update":
        window.location.hash = `update-agent/${id}`;
        break;
      case "rename":
        setTimeout(() => {
          setIsRenaming(true);
          setNewName(label);
        }, 0);
        break;
      case "delete":
        if (type === "folder") {
          deleteFolder({
            folderId: id as Id<"agentFolders">,
          });
        } else {
          setShowDeleteDialog(true);
        }
        break;
    }
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="w-full">
          <div
            className={cn(
              "flex items-center h-10 rounded-md transition-colors relative w-full",
              "hover:bg-primary/50",
              isSelected && "bg-primary"
            )}
            style={{
              paddingLeft: `${depth * 12 + (isFolder ? 8 : 16)}px`,
              paddingRight: "8px",
            }}
            onMouseEnter={() => !isRenaming && setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
          >
            {dragHandleProps && !isRenaming && (
              <div
                {...dragHandleProps.listeners}
                {...dragHandleProps.attributes}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                style={{
                  left: isFolder ? "2rem" : 0,
                  right: showActions ? "2rem" : 0,
                }}
              />
            )}

            {isFolder && (
              <div className="flex-shrink-0 flex items-center">
                <IconButton
                  data-no-dnd="true"
                  variant="ghost"
                  className="h-6 w-6 p-0 flex-shrink-0 relative z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle?.();
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </IconButton>
                <Folder className="h-4 w-4 mr-2" />
              </div>
            )}

            {isRenaming ? (
              <Input
                ref={inputRef}
                data-no-dnd="true"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                variant="secondary"
                inputSize="sm"
                className="flex-1 min-w-0 h-7"
              />
            ) : (
              <span className="truncate flex-1 min-w-0 text-sm">{label}</span>
            )}

            {!isFolder && score !== undefined && (
              <span className="text-sm text-muted-foreground mr-2">
                {score}
              </span>
            )}

            {showActions && !isRenaming && (
              <IconButton
                data-no-dnd="true"
                variant="ghost"
                className="h-6 w-6 p-0 flex-shrink-0 relative z-10"
                onClick={handleMoreButtonClick}
              >
                <MoreHorizontal className="h-4 w-4" />
              </IconButton>
            )}
          </div>
        </ContextMenuTrigger>
        {type === "folder" ? (
          <ContextMenuContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <ContextMenuItem onSelect={handleContextMenuItemSelect("rename")}>
              Rename
            </ContextMenuItem>
            <ContextMenuItem onSelect={handleContextMenuItemSelect("delete")}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        ) : (
          <ContextMenuContent
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <ContextMenuItem
              onSelect={handleContextMenuItemSelect("new-agent")}
            >
              New Agent
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={handleContextMenuItemSelect("new-folder")}
            >
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={handleContextMenuItemSelect("view")}>
              View Prompt
            </ContextMenuItem>
            <ContextMenuItem onSelect={handleContextMenuItemSelect("update")}>
              Update Prompt
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={handleContextMenuItemSelect("rename")}>
              Rename
            </ContextMenuItem>
            <ContextMenuItem onSelect={handleContextMenuItemSelect("delete")}>
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the agent "{label}" and all of its
              generated responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const RootHeader = ({ isDragging }: { isDragging: boolean }) => {
  const { setNodeRef } = useDroppable({
    id: "root-folder",
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center h-10 rounded-md transition-colors",
        isDragging && "bg-primary/20 border-2 border-dashed border-primary"
      )}
    >
      <h2 className="text-sm font-semibold px-2">Agents</h2>
    </div>
  );
};

export const AgentList = () => {
  const currentUser = useGetUser();
  const { selectedAgentId, setSelectedAgentId } = useDashboardStore();
  const [expanded, setExpanded] = useState(new Set<string>([]));
  const [draggingId, setDraggingId] = useState<UniqueIdentifier | null>(null);
  const createNewFolder = useMutation(api.mutations.createFolder);
  const moveAgent = useMutation(api.mutations.moveAgent);
  const moveFolder = useMutation(api.mutations.moveFolder);
  const updateFolderExpanded = useMutation(
    api.mutations.updateFolderExpandedState
  );
  const agentTree = useQuery(api.queries.getUserAgentTree, {
    userId: currentUser?._id,
  });

  // Initialize expanded state from agentTree when it loads
  useEffect(() => {
    if (agentTree) {
      const expandedFolders = new Set<string>();
      const collectExpandedFolders = (items: TreeItemType[]) => {
        items.forEach((item) => {
          if (item.type === "folder" && item.expanded) {
            expandedFolders.add(item.id);
          }
          if (item.type === "folder" && item.children) {
            collectExpandedFolders(item.children);
          }
        });
      };
      collectExpandedFolders(agentTree);
      setExpanded(expandedFolders);
    }
  }, [agentTree]);

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  if (!agentTree?.length) {
    return <div className="px-4 py-2 text-sm text-foreground">No agents</div>;
  }

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingId(null);
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const type = active.data.current?.type;

    if (type === "agent") {
      moveAgent({
        agentId: active.id as Id<"agents">,
        targetFolderId:
          over.id === "root-folder"
            ? undefined
            : (over.id as Id<"agentFolders">),
      });
    } else if (type === "folder") {
      moveFolder({
        folderId: active.id as Id<"agentFolders">,
        targetFolderId:
          over.id === "root-folder"
            ? undefined
            : (over.id as Id<"agentFolders">),
      });
    }
  };

  const handleFolderToggle = (folderId: Id<"agentFolders">) => {
    const newExpanded = new Set(expanded);
    const isCurrentlyExpanded = newExpanded.has(folderId);

    if (isCurrentlyExpanded) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }

    setExpanded(newExpanded);
    updateFolderExpanded({
      folderId,
      expanded: !isCurrentlyExpanded,
    });
  };

  const renderTree = (items: TreeItemType[]) => {
    return items.map((item) => (
      <div key={item.id}>
        {item.type === "folder" ? (
          <DroppableFolder id={item.id}>
            <DraggableTreeItem
              id={item.id}
              type="folder"
              isRenaming={item.isRenaming}
              label={item.name}
              isFolder={true}
              isExpanded={expanded.has(item.id)}
              onToggle={() => handleFolderToggle(item.id as Id<"agentFolders">)}
              depth={item.depth}
              parentFolderId={item.parentFolderId}
            />
            {expanded.has(item.id) &&
              item.children &&
              renderTree(item.children)}
          </DroppableFolder>
        ) : (
          <DraggableTreeItem
            id={item.id}
            type="agent"
            label={item.name}
            isFolder={false}
            onSelect={() => setSelectedAgentId(item.id as Id<"agents">)}
            isSelected={selectedAgentId === item.id}
            depth={item.depth}
            parentFolderId={item.parentFolderId}
            score={(item as any).score}
          />
        )}
      </div>
    ));
  };

  const handleEmptyAreaAction = (action: string) => {
    switch (action) {
      case "new-agent":
        window.location.hash = "make-agent";
        break;
      case "new-folder":
        if (currentUser) {
          createNewFolder({
            userId: currentUser._id,
            name: "New Folder",
            parentFolderId: undefined, // Creates at root level
          });
        }
        break;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="absolute inset-0 flex flex-col">
        <div>
          <RootHeader isDragging={!!draggingId} />
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1">{renderTree(agentTree)}</div>

          <ContextMenu>
            <ContextMenuTrigger>
              <div className="h-24 w-full" /> {/* Clickable empty area */}
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onSelect={() => handleEmptyAreaAction("new-agent")}
              >
                New Agent
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => handleEmptyAreaAction("new-folder")}
              >
                New Folder
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </ScrollArea>

        <DragOverlay>
          {draggingId ? (
            <div className="bg-background shadow-lg rounded-md p-2">
              {findItemNameInTree(agentTree, draggingId)}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

const findItemNameInTree = (
  items: TreeItemType[],
  id: UniqueIdentifier
): string | undefined => {
  for (const item of items) {
    if (item.id === id) return item.name;
    if (item.type === "folder" && item.children) {
      const found = findItemNameInTree(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
};
