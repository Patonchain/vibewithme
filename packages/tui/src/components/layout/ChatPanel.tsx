import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { MessageList } from "../chat/MessageList.js";
import { ChatInput } from "../chat/ChatInput.js";

export function ChatPanel() {
  const isFocused = useUIStore((s) => s.focusedPanel === "chat");

  return (
    <Box
      flexDirection="column"
      width={34}
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
          {"─".repeat(32)}
        </Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        <MessageList />
      </Box>

      {/* Input separator */}
      <Box>
        <Text color={theme.colors.border}>
          {"─".repeat(32)}
        </Text>
      </Box>

      {/* Input */}
      <Box paddingX={1}>
        <ChatInput isFocused={isFocused} />
      </Box>
    </Box>
  );
}
