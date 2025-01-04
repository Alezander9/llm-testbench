import { ArrowLeft } from "lucide-react";
import { IconButton } from "../../../components/ui/icon-button";
import { Button } from "../../../components/ui/button";
import { useAgentEditorStore } from "../../../stores/agent-editor";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";
import { useToast } from "../../../hooks/use-toast";
import { useDashboardStore } from "../../../stores/dashboard";

export const AgentEditorTopBar = () => {
  const currentUser = useGetUser();
  const { mode, editorAgent, reset } = useAgentEditorStore();
  const { setSelectedAgentId } = useDashboardStore();
  const createAgent = useMutation(api.mutations.createAgent);
  const { toast } = useToast();

  const handleBack = () => {
    reset();
    window.location.hash = "";
  };

  const handleCreate = async () => {
    console.log("starting function handleCreate");
    if (!currentUser?._id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an agent.",
        variant: "destructive",
      });
      return;
    }

    if (!editorAgent.name) {
      console.log("no name");
      toast({
        title: "Error Creating Agent",
        description: "Please provide a name for your agent.",
        variant: "destructive",
      });
      return;
    }

    if (!editorAgent.model) {
      toast({
        title: "Error Creating Agent",
        description: "Please select a model for your agent.",
        variant: "destructive",
      });
      return;
    }

    if (!editorAgent.prompt) {
      toast({
        title: "Error Creating Agent",
        description: "Please provide a prompt for your agent.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newAgentId = await createAgent({
        userId: currentUser._id,
        name: editorAgent.name,
        model: editorAgent.model,
        prompt: editorAgent.prompt,
      });
      toast({
        title: "Success",
        description: "Agent created successfully!",
      });
      setSelectedAgentId(newAgentId);
      handleBack();
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full flex-shrink-0 p-2 border-b border-muted sticky top-0 bg-background z-10">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <IconButton variant="ghost" onClick={handleBack} aria-label="Go back">
            <ArrowLeft className="h-6 w-6" />
          </IconButton>
          <h1 className="text-lg font-semibold">
            {mode === "create"
              ? "New Agent"
              : mode === "update"
                ? "Update Agent"
                : "View Agent"}
          </h1>
        </div>

        {mode !== "view" && (
          <Button variant="primary" onClick={handleCreate}>
            {mode === "create" ? "Create" : "Update"}
          </Button>
        )}
      </div>
    </div>
  );
};
