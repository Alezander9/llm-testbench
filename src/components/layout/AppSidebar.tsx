import { PenSquare, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "../../components/ui/sidebar";
import { useSidebar } from "../../components/ui/sidebar";
import { UserButton } from "@clerk/clerk-react";
import { IconButton } from "../../components/ui/icon-button";
import { AgentList } from "../features/agent-list/AgentList";
import { SearchSelector } from "../ui/search-selector";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useGetUser } from "../../hooks/useGetUser";

const AppSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const currentUser = useGetUser();

  const agents = useQuery(api.queries.getUserAgents, {
    userId: currentUser?._id,
  });
  const userState = useQuery(api.queries.getUserState, {
    userId: currentUser?._id,
  });

  const handleAgentSelect = (agentId: Id<"agents">) => {
    // TODO: Implement agent selection logic
    console.log("Selected agent:", agentId);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-2 pt-4 pb-2">
          <div className="flex items-center">
            <SidebarTrigger />
            {currentUser && (
              <SearchSelector
                value={undefined}
                onValueChange={handleAgentSelect}
                items={agents}
                recentIds={userState?.recentAgentIds}
                placeholder="Select agent"
                createNewText="Create new agent"
                onCreateNew={() => {
                  window.location.hash = "make-agent";
                }}
                onEdit={(id) => {
                  window.location.hash = `edit-agent/${id}`;
                }}
                variant="agent"
              />
            )}
            <div className="flex items-center px-2 py-1">
              <UserButton />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="flex flex-col h-full">
            <div className="px-2 flex flex-col flex-1">
              <div
                className="flex items-center h-10 rounded-md transition-colors relative w-full hover:bg-primary/50 px-2 mt-2 mb-4 cursor-pointer"
                onClick={() => {
                  window.location.hash = "make-agent";
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="truncate flex-grow text-sm">
                  Create New Agent
                </span>
              </div>
              <div className="flex-1 relative">
                <AgentList />
              </div>
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
      {/* Icons when sidebar is collapsed */}
      {isCollapsed && (
        <div className="fixed top-4 left-4 flex items-center gap-2 z-50">
          <SidebarTrigger />
          <IconButton
            onClick={() => {
              window.location.hash = "make-agent";
            }}
            variant="ghost"
          >
            <PenSquare className="h-6 w-6" />
          </IconButton>
        </div>
      )}
    </>
  );
};

export default AppSidebar;
