import React, { useEffect, createContext, useContext } from "react";
import { Box, useStdout } from "ink";
import { Header } from "./components/layout/Header.js";
import { Footer } from "./components/layout/Footer.js";
import { Sidebar } from "./components/layout/Sidebar.js";
import { MainPanel } from "./components/layout/MainPanel.js";
import { ChatPanel } from "./components/layout/ChatPanel.js";
import { useKeyBindings } from "./hooks/useKeyBindings.js";
import { useUIStore } from "./store/ui.js";
import { useWorkspaceStore } from "./store/workspace.js";
import { useFileSystem } from "./hooks/useFileSystem.js";
import {
  useCollaboration,
  type RemoteUser,
} from "./hooks/useCollaboration.js";

// Collaboration context available to all components
interface CollabContextValue {
  connected: boolean;
  remoteUsers: RemoteUser[];
  roomId: string | null;
  setPresence: (data: Partial<RemoteUser>) => void;
  sendMessage: (msg: any) => void;
  createHighlight: (highlight: any) => void;
}

export const CollabContext = createContext<CollabContextValue>({
  connected: false,
  remoteUsers: [],
  roomId: null,
  setPresence: () => {},
  sendMessage: () => {},
  createHighlight: () => {},
});

export const useCollab = () => useContext(CollabContext);

interface AppProps {
  projectPath?: string;
  serverUrl?: string;
  token?: string;
  roomId?: string;
}

export function App({ projectPath, serverUrl, token, roomId }: AppProps) {
  const { stdout } = useStdout();
  const setTerminalSize = useUIStore((s) => s.setTerminalSize);
  const setProjectPath = useWorkspaceStore((s) => s.setProjectPath);
  const { loadProject } = useFileSystem();

  // Collaboration
  const collab = useCollaboration(serverUrl, token, roomId);

  // Track terminal size
  useEffect(() => {
    if (!stdout) return;
    const updateSize = () => {
      setTerminalSize(stdout.columns || 120, stdout.rows || 40);
    };
    updateSize();
    stdout.on("resize", updateSize);
    return () => {
      stdout.off("resize", updateSize);
    };
  }, [stdout, setTerminalSize]);

  // Load project
  useEffect(() => {
    if (projectPath) {
      setProjectPath(projectPath);
    }
    loadProject(projectPath);
  }, [projectPath, setProjectPath, loadProject]);

  // Global keybindings
  useKeyBindings();

  // Update presence when panel changes
  const focusedPanel = useUIStore((s) => s.focusedPanel);
  useEffect(() => {
    collab.setPresence({ panel: focusedPanel });
  }, [focusedPanel, collab.setPresence]);

  return (
    <CollabContext.Provider value={collab}>
      <Box flexDirection="column" height="100%">
        <Header />
        <Box flexDirection="row" flexGrow={1}>
          <Sidebar />
          <MainPanel />
          <ChatPanel />
        </Box>
        <Footer />
      </Box>
    </CollabContext.Provider>
  );
}
