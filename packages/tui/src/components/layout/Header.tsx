import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useWorkspaceStore } from "../../store/workspace.js";

export function Header() {
  const projectName = useWorkspaceStore((s) => s.projectName);

  return (
    <Box
      borderStyle="single"
      borderColor={theme.colors.border}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={1}>
        <Text bold color={theme.colors.accent}>
          vibewithme
        </Text>
        <Text color={theme.colors.textDim}>|</Text>
        <Text color={theme.colors.text}>{projectName || "no project"}</Text>
      </Box>
      <Box gap={1}>
        <Text color={theme.colors.success}>* you</Text>
        <Text color={theme.colors.textDim}>v0.1.0</Text>
      </Box>
    </Box>
  );
}
