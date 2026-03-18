export type MessageType = "user" | "agent" | "system";

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  type: MessageType;
  timestamp: number;
  isAiMention?: boolean;
}

export interface AgentEvent {
  id: string;
  sessionId: string;
  type: "tool_use" | "text" | "error" | "complete";
  toolName?: string;
  content: string;
  timestamp: number;
}
