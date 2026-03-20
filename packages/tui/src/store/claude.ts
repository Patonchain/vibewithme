import { create } from "zustand";

export interface ClaudeEvent {
  id: string;
  type: "thinking" | "text" | "tool_start" | "tool_result" | "error" | "complete";
  content: string;
  toolName?: string;
  timestamp: number;
}

interface ClaudeState {
  isRunning: boolean;
  events: ClaudeEvent[];
  currentPrompt: string;
  streamingText: string;
  sessionId: string | null;

  setRunning: (running: boolean) => void;
  addEvent: (event: ClaudeEvent) => void;
  clearEvents: () => void;
  setCurrentPrompt: (prompt: string) => void;
  setStreamingText: (text: string) => void;
  appendStreamingText: (text: string) => void;
  setSessionId: (id: string | null) => void;
}

let eventCounter = 0;

export const useClaudeStore = create<ClaudeState>((set, get) => ({
  isRunning: false,
  events: [],
  currentPrompt: "",
  streamingText: "",
  sessionId: null,

  setRunning: (running) => set({ isRunning: running }),
  addEvent: (event) => {
    set({ events: [...get().events, { ...event, id: `ev_${++eventCounter}` }] });
  },
  clearEvents: () => set({ events: [], streamingText: "" }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  setStreamingText: (text) => set({ streamingText: text }),
  appendStreamingText: (text) => set({ streamingText: get().streamingText + text }),
  setSessionId: (id) => set({ sessionId: id }),
}));
