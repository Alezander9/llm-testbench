import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { useDashboardStore } from "../stores/dashboard";
import { useGetUser } from "./useGetUser";

export function useInitializeSettings() {
  const currentUser = useGetUser();
  const settings = useQuery(api.queries.getUserSettings, {
    userId: currentUser?._id,
  });
  const { setGridColumns, setFontSize, setChatWindowHeight } =
    useDashboardStore();

  useEffect(() => {
    if (settings) {
      // Only update if the setting exists (otherwise keep default from store)
      if (settings.gridColumns) {
        setGridColumns(settings.gridColumns);
      }
      if (settings.fontSize) {
        setFontSize(settings.fontSize);
      }
      if (settings.chatWindowHeight) {
        setChatWindowHeight(settings.chatWindowHeight);
      }
    }
  }, [settings, setGridColumns, setFontSize, setChatWindowHeight]);

  return null;
}
