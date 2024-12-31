import { DraggableAttributes } from "@dnd-kit/core";
import { Id } from "../../../../convex/_generated/dataModel";

export interface TreeItemType {
  id: string;
  name: string;
  type: "folder" | "agent";
  children?: TreeItemType[];
  parentFolderId?: Id<"agentFolders"> | null;
  isRenaming?: boolean;
  score?: number;
  depth: number;
}

export type DragHandleListeners = {
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onPointerDown?: (event: React.PointerEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
};

export type TreeItemProps = {
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

export type DraggableTreeItemProps = TreeItemProps & {
  id: string;
  type: "folder" | "agent";
  isRenaming?: boolean;
};
