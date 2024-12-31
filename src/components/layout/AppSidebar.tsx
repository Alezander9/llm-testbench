import { Search, PenSquare, Plus } from "lucide-react";
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

const AppSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-2 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <IconButton variant="ghost">
                <Search style={{ width: "24px", height: "24px" }} />
              </IconButton>
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
