import { useState, useRef } from "react";
import { useAgentEditorStore } from "../../../stores/agent-editor";
import { ChatWindow } from "../chat-window/ChatWindow";
import { Textarea } from "../../ui/textarea";
import { api } from "../../../../convex/_generated/api";
import { useAction } from "convex/react";
import { useGetUser } from "../../../hooks/useGetUser";
import { nanoid } from "nanoid";
import { IconButton } from "../../ui/icon-button";
import { Send } from "lucide-react";
import { Button } from "../../ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";

export const AgentPreview = () => {
  const currentUser = useGetUser();
  const {
    previewAgent,
    chatHistory,
    addChatMessage,
    updatePreviewAgent,
    editorAgent,
  } = useAgentEditorStore();
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const generatePreview = useAction(api.actions.generatePreviewResponse);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Check if the preview needs to be refreshed
  const needsRefresh =
    previewAgent.prompt !== editorAgent.prompt ||
    previewAgent.model !== editorAgent.model;

  const handleSendMessage = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Error Sending Message",
        description: "Message cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!previewAgent.model) {
      toast({
        title: "Error Sending Message",
        description: "Please select a model for your agent.",
        variant: "destructive",
      });
      return;
    }

    if (!previewAgent.prompt) {
      toast({
        title: "Error Sending Message",
        description: "Please provide a prompt for your agent.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser?._id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to test the agent.",
        variant: "destructive",
      });
      return;
    }

    const messageId = nanoid();
    // Add user message to chat
    addChatMessage({
      role: "user",
      content: userInput,
      id: messageId,
    });

    setUserInput("");
    setIsTyping(true);

    try {
      const response = await generatePreview({
        userId: currentUser._id,
        questionContent: userInput,
        agentPrompt: previewAgent.prompt,
        agentModel: previewAgent.model,
      });

      addChatMessage({
        role: "assistant",
        content: response.content,
        id: nanoid(),
      });

      textareaRef.current?.focus();
    } catch (error) {
      console.error("Failed to generate response:", error);
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      });
      addChatMessage({
        role: "assistant",
        content: "Sorry, there was an error generating a response.",
        id: nanoid(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex-1 relative">
        {needsRefresh && (
          <>
            <div className="absolute left-3 bottom-8 z-10 text-xs text-foreground">
              Changes made
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={updatePreviewAgent}
              className="absolute left-0 bottom-0 z-10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </>
        )}
        <ChatWindow
          messages={chatHistory}
          isTyping={isTyping}
          fontSizeOverride="medium"
          heightOverride="full"
        />
      </div>
      <div className="flex gap-2 items-center">
        <Textarea
          ref={textareaRef}
          variant="secondary"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message to test the agent..."
          className="flex-1 min-h-[60px] resize-none"
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={
            !userInput.trim() ||
            !previewAgent.model ||
            !previewAgent.prompt ||
            !currentUser?._id ||
            isTyping
          }
          variant="ghost"
          aria-label="Send message"
        >
          <Send className="h-6 w-6" />
        </IconButton>
      </div>
    </div>
  );
};
