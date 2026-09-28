import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { MessageList } from "../chat/MessageList.js";
import { ChatInput } from "../chat/ChatInput.js";

export function ChatPanel({ fill = false }: { fill?: boolean }) {
  const isFocused = useUIStore((s) => s.focusedPanel === "chat");
  const terminalWidth = useUIStore((s) => s.terminalWidth);
  const ruleWidth = Math.max(8, (fill ? terminalWidth : 34) - 2);

  return (
    <Box
      flexDirection="column"
      width={fill ? "100%" : 34}
      flexGrow={fill ? 1 : undefined}
      borderStyle="single"
      borderColor={isFocused ? theme.colors.primary : theme.colors.border}
    >
      {/* Header */}
      <Box paddingX={1} justifyContent="space-between">
        <Text bold color={theme.colors.primary}>
          COMMS
        </Text>
        <Text color={theme.colors.textDim}>@ai = CLAUDE</Text>
      </Box>

      {/* Separator */}
      <Box>
        <Text color={theme.colors.border}>
          {"─".repeat(ruleWidth)}
        </Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        <MessageList />
      </Box>

      {/* Input separator */}
      <Box>
        <Text color={theme.colors.border}>
          {"─".repeat(ruleWidth)}
        </Text>
      </Box>

      {/* Input */}
      <Box paddingX={1}>
        <ChatInput isFocused={isFocused} />
      </Box>
    </Box>
  );
}
