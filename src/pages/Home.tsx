import { useState, useEffect } from "react";
import { SidebarProvider } from "../components/ui/sidebar";
import AppSidebar from "../components/layout/AppSidebar";
import { DashboardLayout } from "../components/features/dashboard/DashboardLayout";
import { Settings } from "../components/features/settings/Settings";
import { AgentEditorLayout } from "../components/features/agent-editor/AgentEditorLayout";
import { TestCaseEditorLayout } from "../components/features/test-case-editor/TestCaseEditorLayout";
import { useSyncUser, useInitializeSettings } from "../hooks";
import { useIsMobile } from "../hooks/use-mobile";
import { MobileRestrictionMessage } from "../components/layout/MobileRestrictionMessage";

function Home() {
  const isMobile = useIsMobile();
  const [hash, setHash] = useState(window.location.hash);
  useSyncUser();
  useInitializeSettings();

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isAgentEditor =
    hash.startsWith("#make-agent") ||
    hash.startsWith("#view-agent") ||
    hash.startsWith("#update-agent");
  const isTestCaseEditor =
    hash.startsWith("#make-test-case") || hash.startsWith("#edit-test-case");

  if (isMobile) {
    return <MobileRestrictionMessage />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-1">
        {!isAgentEditor && !isTestCaseEditor && <AppSidebar />}
        <main className="flex-1">
          {!isAgentEditor && !isTestCaseEditor && <DashboardLayout />}
          {hash.startsWith("#settings") && <Settings />}
          {isAgentEditor && <AgentEditorLayout />}
          {isTestCaseEditor && <TestCaseEditorLayout />}
        </main>
      </div>
    </SidebarProvider>
  );
}

export default Home;
