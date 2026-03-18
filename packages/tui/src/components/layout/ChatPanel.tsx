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
      borderColor={isFocused ? theme.colors.borderFocus : theme.colors.border}
    >
      <Box paddingX={1}>
        <Text bold color={theme.colors.primary}>
          Chat
        </Text>
        <Text color={theme.colors.textDim}> | @ai for Claude</Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        <MessageList />
      </Box>

      {/* Input */}
      <Box paddingX={1} borderStyle="single" borderColor={theme.colors.border} borderTop borderBottom={false} borderLeft={false} borderRight={false}>
        <ChatInput isFocused={isFocused} />
      </Box>
    </Box>
  );
}
