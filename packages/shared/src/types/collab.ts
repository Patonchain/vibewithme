export interface CursorPosition {
  file: string;
  line: number;
  column: number;
}

export interface SelectionRange {
  file: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface AwarenessState {
  user: {
    id: string;
    name: string;
    color: string;
  };
  cursor?: CursorPosition;
  selection?: SelectionRange;
  panel: "sidebar" | "workspace" | "chat";
  lastActive: number;
}

export interface HighlightBox {
  id: string;
  userId: string;
  userColor: string;
  region: {
    panel: string;
    startLine?: number;
    endLine?: number;
    label?: string;
  };
  expiresAt: number;
}
