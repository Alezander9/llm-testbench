import React from "react";
import { cn } from "../../../lib/utils";
import { ChatMessage, ChatWindowProps } from "./types";
import { ScrollArea } from "../../ui/scroll-area";
import { Card, CardContent } from "../../ui/card";
import { useDashboardStore } from "../../../stores/dashboard";
import ReactMarkdown from "react-markdown";

const MessageBubble: React.FC<{
  message: ChatMessage;
  fontSizeOverride?: "small" | "medium" | "large";
}> = ({ message, fontSizeOverride }) => {
  const { fontSize } = useDashboardStore();
  const isUser = message.role === "user";

  const actualFontSize = fontSizeOverride || fontSize;

  const fontSizeClass = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  }[actualFontSize];

  const paddingClass = {
    small: "px-2 py-1",
    medium: "px-2.5 py-1",
    large: "px-3 py-1",
  }[actualFontSize];

  return (
    <div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "relative max-w-[90%]",
          paddingClass,
          "border border-foreground/10",
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-none"
            : "bg-background rounded-2xl rounded-bl-none"
        )}
      >
        <div className={cn(fontSizeClass, "break-words")}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="relative bg-background border border-foreground/10 px-4 py-2 rounded-2xl rounded-bl-none">
        <div className="flex space-x-1">
          <div
            className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isTyping = false,
  className,
  heightOverride,
  fontSizeOverride,
  backgroundColor = "transparent",
}) => {
  const { chatWindowHeight } = useDashboardStore();

  return (
    <Card
      className={cn(
        "w-full flex flex-col",
        heightOverride === "full" && "h-full",
        className
      )}
      style={{
        height:
          typeof heightOverride === "number"
            ? `${heightOverride}px`
            : heightOverride === "full"
              ? undefined
              : `${chatWindowHeight}px`,
        backgroundColor,
      }}
    >
      <CardContent className="flex-1 pr-[2px] pl-3 py-3 overflow-hidden">
        <ScrollArea className="h-full pr-[10px]">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                fontSizeOverride={fontSizeOverride}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
