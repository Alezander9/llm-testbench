import { create } from "zustand";
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
  setQuestionResponse: (questionId: string, response: string) => void;
  setQuestionIsTyping: (questionId: string, isTyping: boolean) => void;
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

export const useDashboardStore = create<DashboardState>((set) => ({
  gridColumns: userSettingDefaults.gridColumns,
  setGridColumns: (columns) => set({ gridColumns: columns }),
  selectedTestCaseId: null,
  setSelectedTestCaseId: (id) => set({ selectedTestCaseId: id }),
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),
  questionsMap: {},
  setQuestionResponse: (questionId, response) =>
    set((state) => ({
      questionsMap: {
        ...state.questionsMap,
        [questionId]: { ...state.questionsMap[questionId], response },
      },
    })),
  setQuestionIsTyping: (questionId, isTyping) =>
    set((state) => ({
      questionsMap: {
        ...state.questionsMap,
        [questionId]: { ...state.questionsMap[questionId], isTyping },
      },
    })),
  runIndex: 1,
  setRunIndex: (index) => set({ runIndex: index }),
  generatingQuestions: new Set<Id<"testQuestions">>(),
  addGeneratingQuestion: (questionId) =>
    set((state) => ({
      generatingQuestions: new Set(state.generatingQuestions).add(questionId),
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
}));
