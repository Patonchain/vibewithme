import { useEffect, useRef, useCallback, useState } from "react";
import * as Y from "yjs";
import { useChatStore } from "../store/chat.js";
import type { ChatMessage } from "@vibewithme/shared";

export interface RemoteUser {
  id: string;
  name: string;
  color: string;
  panel: string;
  cursor?: { file: string; line: number };
  lastActive: number;
}

interface CollabState {
  connected: boolean;
  remoteUsers: RemoteUser[];
  roomId: string | null;
}

export function useCollaboration(serverUrl?: string, token?: string, roomId?: string) {
  const [state, setState] = useState<CollabState>({
    connected: false,
    remoteUsers: [],
    roomId: roomId ?? null,
  });

  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<any>(null);

  useEffect(() => {
    if (!serverUrl || !token || !roomId) return;

    const doc = new Y.Doc();
    docRef.current = doc;

    // Dynamically import y-websocket (it's ESM-only)
    import("y-websocket").then(({ WebsocketProvider }) => {
      const wsUrl = serverUrl.replace(/^http/, "ws");
      const provider = new WebsocketProvider(wsUrl, roomId, doc, {
        params: { token },
      });

      providerRef.current = provider;

      // Connection status
      provider.on("status", ({ status }: { status: string }) => {
        setState((s) => ({ ...s, connected: status === "connected" }));
      });

      // Awareness (presence)
      provider.awareness.on("change", () => {
        const states = Array.from(
          provider.awareness.getStates().entries(),
        );
        const remoteUsers: RemoteUser[] = states
          .filter(([clientId]) => clientId !== doc.clientID)
          .map(([, state]) => state as RemoteUser)
          .filter((s) => s?.id);

        setState((prev) => ({ ...prev, remoteUsers }));
      });

      // Sync chat messages from Y.js to local store
      const chatArray = doc.getArray<ChatMessage>("chat");
      chatArray.observe(() => {
        const messages = chatArray.toArray();
        useChatStore.setState({ messages });
      });
    });

    return () => {
      providerRef.current?.destroy();
      doc.destroy();
    };
  }, [serverUrl, token, roomId]);

  // Set local awareness state
  const setPresence = useCallback(
    (presenceData: Partial<RemoteUser>) => {
      if (!providerRef.current) return;
      providerRef.current.awareness.setLocalState({
        ...providerRef.current.awareness.getLocalState(),
        ...presenceData,
        lastActive: Date.now(),
      });
    },
    [],
  );

  // Send chat message via Y.js (syncs to all clients)
  const sendMessage = useCallback(
    (msg: ChatMessage) => {
      if (!docRef.current) {
        // No collab — just add locally
        useChatStore.getState().addMessage(msg);
        return;
      }
      const chatArray = docRef.current.getArray<ChatMessage>("chat");
      chatArray.push([msg]);
    },
    [],
  );

  // Create a highlight box visible to other users
  const createHighlight = useCallback(
    (highlight: {
      panel: string;
      startLine?: number;
      endLine?: number;
      label?: string;
    }) => {
      if (!providerRef.current) return;
      const currentState = providerRef.current.awareness.getLocalState() || {};
      providerRef.current.awareness.setLocalState({
        ...currentState,
        highlight: {
          ...highlight,
          expiresAt: Date.now() + 10000, // 10 second highlight
        },
        lastActive: Date.now(),
      });
    },
    [],
  );

  return {
    ...state,
    setPresence,
    sendMessage,
    createHighlight,
    doc: docRef.current,
  };
}
