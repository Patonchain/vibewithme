import { create } from "zustand";
import type { ChatMessage } from "@vibewithme/shared";
import { createMessageId } from "@vibewithme/shared";

interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  isAgentRunning: boolean;
  agentStreamText: string;

  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setInputValue: (value: string) => void;
  setAgentRunning: (running: boolean) => void;
  setAgentStreamText: (text: string) => void;
  appendAgentStreamText: (text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  inputValue: "",
  isAgentRunning: false,
  agentStreamText: "",

  addMessage: (msg) => {
    const message: ChatMessage = {
      ...msg,
      id: createMessageId(),
      timestamp: Date.now(),
    };
    set({ messages: [...get().messages, message] });
  },

  setInputValue: (value) => set({ inputValue: value }),
  setAgentRunning: (running) => set({ isAgentRunning: running }),
  setAgentStreamText: (text) => set({ agentStreamText: text }),
  appendAgentStreamText: (text) =>
    set({ agentStreamText: get().agentStreamText + text }),
}));
