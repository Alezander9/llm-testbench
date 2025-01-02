import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Id } from "../../convex/_generated/dataModel";
import { userSettingDefaults } from "../components/features/settings/types";

interface DashboardState {
  gridColumns: 1 | 2 | 3 | 4 | 5;
  setGridColumns: (columns: 1 | 2 | 3 | 4 | 5) => void;
  selectedTestCaseId: Id<"testCases"> | null;
  setSelectedTestCaseId: (id: Id<"testCases"> | null) => void;
  selectedAgentId: Id<"agents"> | null;
  setSelectedAgentId: (id: Id<"agents"> | null) => void;
  questionsMap: Record<
    string,
    {
      content: string;
      response?: string;
      isTyping: boolean;
    }
  >;
  runIndex: number;
  setRunIndex: (index: number) => void;
  generatingQuestions: Set<Id<"testQuestions">>;
  addGeneratingQuestion: (questionId: Id<"testQuestions">) => void;
  removeGeneratingQuestion: (questionId: Id<"testQuestions">) => void;
  clearGeneratingQuestions: () => void;
  fontSize: "small" | "medium" | "large";
  chatWindowHeight: number;
  setFontSize: (size: "small" | "medium" | "large") => void;
  setChatWindowHeight: (height: number) => void;
}

// Add custom storage handler for Set serialization
const customStorage = {
  getItem: (name: string): string | null => {
    const str = localStorage.getItem(name);
    if (!str) return str;
    const data = JSON.parse(str);
    if (data.state.generatingQuestions) {
      data.state.generatingQuestions = new Set(data.state.generatingQuestions);
    }
    return JSON.stringify(data);
  },
  setItem: (name: string, value: string) => {
    const data = JSON.parse(value);
    if (data.state.generatingQuestions instanceof Set) {
      data.state.generatingQuestions = Array.from(
        data.state.generatingQuestions
      );
    }
    localStorage.setItem(name, JSON.stringify(data));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      gridColumns: userSettingDefaults.gridColumns,
      setGridColumns: (columns) => set({ gridColumns: columns }),
      selectedTestCaseId: null,
      setSelectedTestCaseId: (id) => set({ selectedTestCaseId: id }),
      selectedAgentId: null,
      setSelectedAgentId: (id) => set({ selectedAgentId: id }),
      questionsMap: {},
      runIndex: 1,
      setRunIndex: (index) => set({ runIndex: index }),
      generatingQuestions: new Set<Id<"testQuestions">>(),
      addGeneratingQuestion: (questionId) =>
        set((state) => ({
          generatingQuestions: new Set(state.generatingQuestions).add(
            questionId
          ),
        })),
      removeGeneratingQuestion: (questionId) =>
        set((state) => {
          const newSet = new Set(state.generatingQuestions);
          newSet.delete(questionId);
          return { generatingQuestions: newSet };
        }),
      clearGeneratingQuestions: () =>
        set({ generatingQuestions: new Set<Id<"testQuestions">>() }),
      fontSize: userSettingDefaults.fontSize,
      chatWindowHeight: userSettingDefaults.chatWindowHeight,
      setFontSize: (size) => set({ fontSize: size }),
      setChatWindowHeight: (height) => set({ chatWindowHeight: height }),
    }),
    {
      name: "dashboard-storage",
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        selectedAgentId: state.selectedAgentId,
        selectedTestCaseId: state.selectedTestCaseId,
        gridColumns: state.gridColumns,
        fontSize: state.fontSize,
        chatWindowHeight: state.chatWindowHeight,
      }),
    }
  )
);
