import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { useChatStore } from "../../store/chat.js";

export function Footer() {
  const focusedPanel = useUIStore((s) => s.focusedPanel);
  const isAgentRunning = useChatStore((s) => s.isAgentRunning);

  return (
    <Box paddingX={1} justifyContent="space-between">
      <Box gap={2}>
        <Text color={theme.colors.textDim}>
          <Text bold color={focusedPanel === "sidebar" ? theme.colors.primary : undefined}>
            ^1
          </Text>{" "}
          Files
        </Text>
        <Text color={theme.colors.textDim}>
          <Text bold color={focusedPanel === "workspace" ? theme.colors.primary : undefined}>
            ^2
          </Text>{" "}
          Editor
        </Text>
        <Text color={theme.colors.textDim}>
          <Text bold color={focusedPanel === "chat" ? theme.colors.primary : undefined}>
            ^3
          </Text>{" "}
          Chat
        </Text>
        <Text color={theme.colors.textDim}>
          <Text bold>^P</Text> Palette
        </Text>
        <Text color={theme.colors.textDim}>
          <Text bold>@ai</Text> Claude
        </Text>
      </Box>
      <Box gap={1}>
        {isAgentRunning && (
          <Text color={theme.colors.aiBubble}>Claude is working...</Text>
        )}
      </Box>
    </Box>
  );
}
