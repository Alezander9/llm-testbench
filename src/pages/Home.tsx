import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "../components/ui/sidebar";
import AppSidebar from "../components/layout/AppSidebar";
import { DashboardLayout } from "../components/features/dashboard/DashboardLayout";
import { Settings } from "../components/features/settings/Settings";
import { AgentEditorLayout } from "../components/features/agent-editor/AgentEditorLayout";
import { TestCaseEditorLayout } from "../components/features/test-case-editor/TestCaseEditorLayout";
import { useSyncUser, useInitializeSettings } from "../hooks";

function Home() {
  useSyncUser();
  useInitializeSettings();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <AppSidebar />
                <main className="flex-1">
                  <DashboardLayout />
                </main>
              </>
            }
          />
          <Route
            path="/settings"
            element={
              <>
                <AppSidebar />
                <main className="flex-1">
                  <Settings />
                </main>
              </>
            }
          />
          <Route
            path="/agent/*"
            element={
              <main className="flex-1">
                <AgentEditorLayout />
              </main>
            }
          />
          <Route
            path="/test-case/*"
            element={
              <main className="flex-1">
                <TestCaseEditorLayout />
              </main>
            }
          />
        </Routes>
      </div>
    </SidebarProvider>
  );
}

export default Home;
