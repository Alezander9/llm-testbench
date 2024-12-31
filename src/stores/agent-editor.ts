import { create } from "zustand";

type EditorMode = "create" | "update" | "view";
type PreviewMode = "preview" | "compare";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface AgentInput {
  _id: string;
  userId: string;
  model: string;
  prompt: string;
  name: string;
  score?: number;
}

interface AgentEditorState {
  // Current state of the editor
  editorAgent: AgentInput;
  setEditorAgent: (agent: Partial<AgentInput>) => void;

  // Agent being used for comparison
  comparisonAgent: AgentInput;
  setComparisonAgent: (agent: AgentInput) => void;

  // Agent being used for preview/testing
  previewAgent: AgentInput;
  updatePreviewAgent: () => void; // Copies editor agent to preview

  // Mode management
  mode: EditorMode;
  setMode: (mode: EditorMode) => void;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;

  // Preview chat history
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // Reset the entire store
  reset: () => void;
}

const initialState = {
  editorAgent: {
    _id: "",
    userId: "",
    model: "",
    prompt: "",
    name: "",
  },
  comparisonAgent: {
    _id: "",
    userId: "",
    model: "",
    prompt: "",
    name: "",
  },
  previewAgent: {
    _id: "",
    userId: "",
    model: "",
    prompt: "",
    name: "",
  },
  mode: "create" as EditorMode,
  previewMode: "preview" as PreviewMode,
  chatHistory: [] as ChatMessage[],
};

export const useAgentEditorStore = create<AgentEditorState>((set) => ({
  ...initialState,

  setEditorAgent: (agent) =>
    set((state) => ({
      editorAgent: { ...state.editorAgent, ...agent },
    })),

  setComparisonAgent: (agent) =>
    set((state) => ({
      comparisonAgent: { ...state.comparisonAgent, ...agent },
    })),

  updatePreviewAgent: () =>
    set((state) => ({
      previewAgent: { ...state.editorAgent },
      chatHistory: [],
    })),

  setMode: (mode) => set({ mode }),

  setPreviewMode: (previewMode) => set({ previewMode }),

  addChatMessage: (message) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, message],
    })),

  clearChat: () => set({ chatHistory: [] }),

  reset: () => set(initialState),
}));
