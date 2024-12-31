import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

type EditorMode = "create" | "edit";

interface TestQuestion {
  id?: Id<"testQuestions">;
  content: string;
  orderIndex: number;
  isLocked?: boolean;
}

interface TestCase {
  _id?: Id<"testCases">;
  userId?: Id<"users">;
  name: string;
  description?: string;
  questions: TestQuestion[];
}

interface TestCaseEditorState {
  // Current state of the editor
  editorTestCase: TestCase;
  setEditorTestCase: (testCase: Partial<TestCase>) => void;

  // Question management
  addQuestion: () => void;
  removeQuestion: (index: number) => void;
  updateQuestion: (index: number, content: string) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;

  // Mode management
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;

  // Reset the entire store
  reset: () => void;

  // New tracking states
  questionsAdded: number;
  questionsRemoved: number;
}

const initialState = {
  editorTestCase: {
    name: "",
    description: "",
    questions: [{ content: "", orderIndex: 0 }],
  },
  mode: "create" as EditorMode,
  questionsAdded: 0,
  questionsRemoved: 0,
};

export const useTestCaseEditorStore = create<TestCaseEditorState>((set) => ({
  ...initialState,

  setEditorTestCase: (testCase) =>
    set((state) => ({
      editorTestCase: {
        ...state.editorTestCase,
        ...testCase,
      },
    })),

  addQuestion: () =>
    set((state) => ({
      editorTestCase: {
        ...state.editorTestCase,
        questions: [
          ...state.editorTestCase.questions,
          {
            content: "",
            orderIndex: state.editorTestCase.questions.length,
          },
        ],
      },
      questionsAdded: state.questionsAdded + 1,
    })),

  removeQuestion: (index) =>
    set((state) => ({
      editorTestCase: {
        ...state.editorTestCase,
        questions: state.editorTestCase.questions
          .filter((_, i) => i !== index)
          .map((q, i) => ({ ...q, orderIndex: i })),
      },
      questionsRemoved: state.questionsRemoved + 1,
    })),

  updateQuestion: (index, content) =>
    set((state) => ({
      editorTestCase: {
        ...state.editorTestCase,
        questions: state.editorTestCase.questions.map((q, i) =>
          i === index ? { ...q, content } : q
        ),
      },
    })),

  reorderQuestions: (startIndex, endIndex) =>
    set((state) => {
      const questions = [...state.editorTestCase.questions];
      const [removed] = questions.splice(startIndex, 1);
      questions.splice(endIndex, 0, removed);

      return {
        editorTestCase: {
          ...state.editorTestCase,
          questions: questions.map((q, i) => ({ ...q, orderIndex: i })),
        },
      };
    }),

  setMode: (mode) => set({ mode }),

  reset: () => set(initialState),
}));
