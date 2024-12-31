export type MessageRole = "user" | "system" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  className?: string;
  heightOverride?: number | "full";
  fontSizeOverride?: "small" | "medium" | "large";
  backgroundColor?: string;
}
