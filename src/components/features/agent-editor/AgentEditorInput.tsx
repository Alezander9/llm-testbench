import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAgentEditorStore } from "../../../stores/agent-editor";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import { Input } from "../../../components/ui/input";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";
import { AVAILABLE_MODELS } from "../../features/llm/available-models";

interface AgentEditorInputProps {
  viewOnlyMode?: boolean;
}

export const AgentEditorInput = ({
  viewOnlyMode = false,
}: AgentEditorInputProps) => {
  const currentUser = useGetUser();
  const { editorAgent, setEditorAgent, comparisonAgent, setComparisonAgent } =
    useAgentEditorStore();
  const agents =
    useQuery(api.queries.getUserAgents, {
      userId: currentUser?._id,
    }) ?? [];

  // Use either the comparison agent or editor agent based on mode
  const displayAgent = viewOnlyMode ? comparisonAgent : editorAgent;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          {viewOnlyMode ? "Compare With" : "Name"}
        </span>
        {viewOnlyMode ? (
          <Select
            value={comparisonAgent._id || undefined}
            onValueChange={(agentId) => {
              const selectedAgent = agents.find(
                (agent) => agent._id === agentId
              );
              if (selectedAgent) {
                setComparisonAgent({
                  _id: selectedAgent._id,
                  userId: selectedAgent.userId,
                  name: selectedAgent.name,
                  model: selectedAgent.model,
                  prompt: selectedAgent.prompt,
                  score: selectedAgent.score,
                });
              }
            }}
          >
            <SelectTrigger variant="secondary" className="w-[220px]">
              <SelectValue placeholder="Select Agent to Compare" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem
                  key={agent._id}
                  value={agent._id}
                  className="cursor-pointer"
                >
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Agent Name"
            value={displayAgent.name || ""}
            onChange={(e) => setEditorAgent({ name: e.target.value })}
            disabled={viewOnlyMode}
            variant={viewOnlyMode ? "viewOnly" : "secondary"}
            className={cn("border-foreground")}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Model</span>
        <Select
          value={displayAgent.model || undefined}
          onValueChange={(value) => setEditorAgent({ model: value })}
          disabled={viewOnlyMode}
        >
          <SelectTrigger
            variant={viewOnlyMode ? "viewOnly" : "secondary"}
            className={cn("w-[220px]")}
          >
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AVAILABLE_MODELS).map(([modelId, displayName]) => (
              <SelectItem
                key={modelId}
                value={modelId}
                className="cursor-pointer"
              >
                {displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <span className="text-sm font-medium">System Prompt</span>
        <Textarea
          placeholder="Enter your prompt here..."
          value={displayAgent.prompt || ""}
          onChange={(e) => setEditorAgent({ prompt: e.target.value })}
          disabled={viewOnlyMode}
          variant={viewOnlyMode ? "viewOnly" : "secondary"}
          className={cn("resize-none flex-1 min-h-[300px] font-mono")}
        />
      </div>
    </div>
  );
};
