import React, { useEffect } from "react";
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

interface AppProps {
  projectPath?: string;
}

export function App({ projectPath }: AppProps) {
  const { stdout } = useStdout();
  const setTerminalSize = useUIStore((s) => s.setTerminalSize);
  const setProjectPath = useWorkspaceStore((s) => s.setProjectPath);
  const { loadProject } = useFileSystem();

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

  return (
    <Box flexDirection="column" height="100%">
      <Header />
      <Box flexDirection="row" flexGrow={1}>
        <Sidebar />
        <MainPanel />
        <ChatPanel />
      </Box>
      <Footer />
    </Box>
  );
}
