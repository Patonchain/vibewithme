import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { useWorkspaceStore } from "../../store/workspace.js";
import { useClaudeStore } from "../../store/claude.js";
import { FileViewer } from "../workspace/FileViewer.js";
import { ClaudeTerminal } from "../workspace/ClaudeTerminal.js";

export function MainPanel() {
  const isFocused = useUIStore((s) => s.focusedPanel === "workspace");
  const activeFile = useWorkspaceStore((s) => s.activeFile);
  const projectName = useWorkspaceStore((s) => s.projectName);
  const { isRunning, events } = useClaudeStore();

  // Show Claude terminal when Claude is active or has recent events
  const showClaude = isRunning || events.length > 0;

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      borderStyle="single"
      borderColor={isFocused ? theme.colors.primary : theme.colors.border}
    >
      {/* Tab bar */}
      <Box paddingX={1} gap={2}>
        {activeFile && (
          <Text
            color={!showClaude ? theme.colors.primary : theme.colors.textDim}
            bold={!showClaude}
          >
            {!showClaude ? "►" : " "}
            {activeFile.split("/").pop()?.toUpperCase()}
          </Text>
        )}
        {showClaude && (
          <Text color={theme.colors.warning} bold>
            ► CLAUDE TERMINAL
          </Text>
        )}
        {!activeFile && !showClaude && (
          <Text color={theme.colors.textDim}>NO FILE</Text>
        )}
      </Box>

      {/* Separator */}
      <Box>
        <Text color={theme.colors.border}>
          {"─".repeat(50)}
        </Text>
      </Box>

      {/* Content */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {showClaude ? (
          <ClaudeTerminal isFocused={isFocused} />
        ) : activeFile ? (
          <FileViewer isFocused={isFocused} />
        ) : (
          <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
          >
            <Text color={theme.colors.textDim}>
              {projectName
                ? "SELECT A FILE FROM SIDEBAR"
                : "NO PROJECT LOADED"}
            </Text>
            <Text color={theme.colors.textDim}>
              ^1 TO FOCUS FILE TREE
            </Text>
            <Text color={theme.colors.textDim}>
              @ai IN CHAT TO START CLAUDE
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
