import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { useClaudeStore } from "../../store/claude.js";

export function Footer() {
  const focusedPanel = useUIStore((s) => s.focusedPanel);
  const isClaudeRunning = useClaudeStore((s) => s.isRunning);

  const items = [
    { key: "^1", label: "FILES", panel: "sidebar" as const },
    { key: "^2", label: "EDITOR", panel: "workspace" as const },
    { key: "^3", label: "CHAT", panel: "chat" as const },
    { key: "^P", label: "PALETTE", panel: null },
    { key: "@ai", label: "CLAUDE", panel: null },
  ];

  return (
    <Box paddingX={1} justifyContent="space-between">
      <Box gap={2}>
        {items.map((item) => (
          <Text key={item.key} color={theme.colors.textDim}>
            <Text
              bold
              color={
                item.panel === focusedPanel
                  ? theme.colors.primary
                  : theme.colors.secondary
              }
            >
              {item.key}
            </Text>{" "}
            {item.label}
          </Text>
        ))}
      </Box>
      <Box gap={1}>
        {isClaudeRunning && (
          <Text color={theme.colors.warning}>
            ◈ PROCESSING | ^C STOP
          </Text>
        )}
        <Text color={theme.colors.textDim}>
          NERV//OS v0.1
        </Text>
      </Box>
    </Box>
  );
}
