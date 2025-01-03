// components/features/settings/Settings.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Monitor, HelpCircle, CreditCard, X, Key } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { IconButton } from "../../../components/ui/icon-button";
import { useDashboardStore } from "../../../stores/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useGetUser } from "../../../hooks/useGetUser";

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: Monitor },
  { id: "apikeys", label: "API Keys", icon: Key },
  { id: "feedback", label: "Feedback", icon: HelpCircle },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

export function Settings() {
  const currentUser = useGetUser();
  const [section, setSection] =
    useState<(typeof SECTIONS)[number]["id"]>("dashboard");
  const {
    gridColumns,
    setGridColumns,
    fontSize,
    setFontSize,
    chatWindowHeight,
    setChatWindowHeight,
  } = useDashboardStore();
  const updateSetting = useMutation(api.mutations.updateUserSetting);

  const handleClose = () => {
    window.location.hash = "";
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-[680px] h-[540px] p-0" hideCloseButton>
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Settings</DialogTitle>
            <IconButton variant="ghost" onClick={handleClose}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>
        </DialogHeader>

        <div className="flex h-[calc(540px-65px)]">
          {/* Sidebar */}
          <div className="w-[200px] border-r p-2">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={section === id ? "secondary" : "disabled"}
                className="w-full justify-start gap-2 mb-1"
                onClick={() => setSection(id)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {section === "dashboard" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Grid Columns</h3>
                  <Select
                    value={gridColumns.toString()}
                    onValueChange={async (value) => {
                      const columns = Number(value) as 1 | 2 | 3 | 4 | 5;
                      if (!currentUser?._id) {
                        return;
                      }
                      await updateSetting({
                        userId: currentUser?._id,
                        settingKey: "gridColumns",
                        settingValue: columns,
                      });
                      setGridColumns(columns);
                    }}
                  >
                    <SelectTrigger variant="secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Column" : "Columns"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Font Size</h3>
                  <Select
                    value={fontSize}
                    onValueChange={async (newSize) => {
                      if (!currentUser?._id) {
                        return;
                      }
                      await updateSetting({
                        userId: currentUser?._id,
                        settingKey: "fontSize",
                        settingValue: newSize,
                      });
                      setFontSize(newSize as "small" | "medium" | "large");
                    }}
                  >
                    <SelectTrigger variant="secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Chat Window Height</h3>
                  <Select
                    value={chatWindowHeight.toString()}
                    onValueChange={async (value) => {
                      if (!currentUser?._id) {
                        return;
                      }
                      const height = Number(value);
                      await updateSetting({
                        userId: currentUser?._id,
                        settingKey: "chatWindowHeight",
                        settingValue: height,
                      });
                      setChatWindowHeight(height);
                    }}
                  >
                    <SelectTrigger variant="secondary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 7 }, (_, i) => (i + 2) * 100).map(
                        (height) => (
                          <SelectItem key={height} value={height.toString()}>
                            {height}px
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
