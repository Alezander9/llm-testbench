import { useState, useRef, useEffect } from "react";
import { useAgentEditorStore } from "../../../stores/agent-editor";
import { ChatWindow } from "../chat-window/ChatWindow";
import { Textarea } from "../../ui/textarea";
import { api } from "../../../../convex/_generated/api";
import { useAction } from "convex/react";
import { useGetUser } from "../../../hooks/useGetUser";
import { nanoid } from "nanoid";
import { IconButton } from "../../ui/icon-button";
import { Send } from "lucide-react";
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
  const [showChangesApplied, setShowChangesApplied] = useState(false);

  const sendMessage = async (content: string) => {
    if (
      !content.trim() ||
      !currentUser?._id ||
      !previewAgent.model ||
      !previewAgent.prompt
    ) {
      return;
    }

    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      // Add user message
      const userMessageId = nanoid();
      addChatMessage({
        role: "user",
        content: content,
        id: userMessageId,
      });

      setUserInput("");

      const response = await generatePreview({
        userId: currentUser._id,
        questionContent: content,
        agentPrompt: previewAgent.prompt,
        agentModel: previewAgent.model,
        chatHistory: chatHistory.map(({ role, content }) => ({
          role,
          content,
        })),
      });

      // Add assistant response
      addChatMessage({
        role: "assistant",
        content: response.content,
        id: nanoid(),
      });

      setIsTyping(false);
    } catch (error) {
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
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (isTyping) return;

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

    await sendMessage(userInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Effect to handle auto-sync when textarea is focused
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleFocus = () => {
      const hasUnappliedChanges =
        previewAgent.prompt !== editorAgent.prompt ||
        previewAgent.model !== editorAgent.model;

      if (hasUnappliedChanges) {
        console.log(
          "Textarea focused with unapplied changes - updating preview agent"
        );
        updatePreviewAgent();
        setShowChangesApplied(true);

        // Hide the message after 3 seconds
        setTimeout(() => {
          setShowChangesApplied(false);
        }, 1500);
      }
    };

    textarea.addEventListener("focus", handleFocus);
    return () => textarea.removeEventListener("focus", handleFocus);
  }, [previewAgent, editorAgent, updatePreviewAgent]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-[calc(100vh-56.8px-68px)] gap-4 p-4"
    >
      <div className="flex-1 relative overflow-hidden">
        {showChangesApplied && (
          <div
            className="absolute top-0 left-0 right-0 z-10 text-primary-foreground text-md py-2 text-center animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full"
            data-state={showChangesApplied ? "open" : "closed"}
          >
            Changes applied
          </div>
        )}
        <ChatWindow
          messages={chatHistory}
          isTyping={isTyping}
          fontSizeOverride="medium"
          heightOverride="full"
          className="h-full"
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
          disabled={isTyping}
        />
        <IconButton
          type="submit"
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
    </form>
  );
};
