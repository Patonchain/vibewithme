import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { useWorkspaceStore } from "../../store/workspace.js";
import { FileViewer } from "../workspace/FileViewer.js";

export function MainPanel() {
  const isFocused = useUIStore((s) => s.focusedPanel === "workspace");
  const activeFile = useWorkspaceStore((s) => s.activeFile);
  const projectName = useWorkspaceStore((s) => s.projectName);

  return (
    <Box
      flexDirection="column"
      flexGrow={1}
      borderStyle="single"
      borderColor={isFocused ? theme.colors.borderFocus : theme.colors.border}
    >
      {/* Tab bar for open files */}
      <Box paddingX={1}>
        {activeFile ? (
          <Text color={theme.colors.primary} bold>
            {activeFile.split("/").pop()}
          </Text>
        ) : (
          <Text color={theme.colors.textDim}>no file open</Text>
        )}
      </Box>

      {/* Content */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {activeFile ? (
          <FileViewer isFocused={isFocused} />
        ) : (
          <Box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            flexGrow={1}
          >
            <Text color={theme.colors.textDim}>
              {projectName ? "Select a file from the sidebar" : "No project loaded"}
            </Text>
            <Text color={theme.colors.textDim}>
              Use ^1 to focus the file tree
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
