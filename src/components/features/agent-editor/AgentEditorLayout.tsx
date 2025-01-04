import { useEffect } from "react";
import { useAgentEditorStore } from "../../../stores/agent-editor";
import { AgentEditorTopBar } from "./AgentEditorTopBar";
import { AgentEditorInput } from "./AgentEditorInput";
import { AgentPreview } from "./AgentPreview";
import { PreviewToggle } from "./PreviewToggle";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const getNextVersionName = (name: string): string => {
  const versionMatch = name.match(/v(\d+)$/);
  if (versionMatch) {
    const currentVersion = parseInt(versionMatch[1]);
    return name.replace(/v\d+$/, `v${currentVersion + 1}`);
  }
  return `${name} v1`;
};

export const AgentEditorLayout = () => {
  const {
    mode,
    previewMode,
    reset,
    setMode,
    setEditorAgent,
    setComparisonAgent,
    updatePreviewAgent,
  } = useAgentEditorStore();

  const getAgentIdFromHash = () => {
    const hash = window.location.hash;
    const match = hash.match(/#(view|update)-agent\/(.+)/);
    return match ? (match[2] as Id<"agents">) : null;
  };

  const agentId = getAgentIdFromHash();
  const agent = useQuery(api.queries.getAgent, {
    agentId: agentId ?? undefined,
  });

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.startsWith("#make-agent")) {
      setMode("create");
    } else if (hash.startsWith("#view-agent/")) {
      setMode("view");
      if (agent) {
        setEditorAgent({
          name: agent.name,
          model: agent.model,
          prompt: agent.prompt,
        });
        setComparisonAgent({
          _id: agent._id,
          userId: agent.userId,
          name: agent.name,
          model: agent.model,
          prompt: agent.prompt,
        });
        updatePreviewAgent();
      }
    } else if (hash.startsWith("#update-agent/")) {
      setMode("update");
      if (agent) {
        setEditorAgent({
          name: getNextVersionName(agent.name),
          model: agent.model,
          prompt: agent.prompt,
        });
        updatePreviewAgent();
      }
    }
  }, [window.location.hash, agent, setMode, setEditorAgent]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <div className="flex flex-col w-full h-full flex-1">
      <AgentEditorTopBar />
      <div className="flex flex-1 gap-12 px-8 relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/25 -z-10" />
        <div className="flex-1 min-w-0 pt-7 mt-10">
          <AgentEditorInput viewOnlyMode={mode === "view"} />
        </div>
        <div className="flex-1 min-w-0">
          <RightPanelContent
            mode={mode}
            previewMode={previewMode}
            agentId={agentId}
          />
        </div>
      </div>
    </div>
  );
};

const RightPanelContent = ({
  mode,
  previewMode,
  agentId,
}: {
  mode: string;
  previewMode: string;
  agentId: Id<"agents"> | null;
}) => {
  if (mode === "view") {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <button
          onClick={() => {
            window.location.hash = `update-agent/${agentId}`;
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Update Agent
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full ">
      <div className="py-2 w-full">
        <PreviewToggle />
      </div>
      {previewMode === "preview" ? (
        <AgentPreview />
      ) : (
        <AgentEditorInput viewOnlyMode={true} />
      )}
    </div>
  );
};
