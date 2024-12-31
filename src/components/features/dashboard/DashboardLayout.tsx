import { DashboardControlPanel } from "./DashboardControlPanel";
import { DashboardGrid } from "./DashboardGrid";

export const DashboardLayout = () => {
  return (
    <div className="flex flex-col w-full h-full flex-1">
      <DashboardControlPanel />
      <DashboardGrid />
    </div>
  );
};
