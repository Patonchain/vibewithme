import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useChatStore } from "../../store/chat.js";
import { useClaudeStore } from "../../store/claude.js";

export function MessageList() {
  const { messages } = useChatStore();
  const isClaudeRunning = useClaudeStore((s) => s.isRunning);

  if (messages.length === 0 && !isClaudeRunning) {
    return (
      <Box flexDirection="column" gap={1} paddingY={1}>
        <Text color={theme.colors.textDim}>
          ── NO MESSAGES ──
        </Text>
        <Text color={theme.colors.textDim}>
          Type below to chat.
        </Text>
        <Text color={theme.colors.textDim}>
          <Text color={theme.colors.primary}>@ai</Text> to invoke CLAUDE.
        </Text>
      </Box>
    );
  }

  const maxMessages = 20;
  const visibleMessages = messages.slice(-maxMessages);

  return (
    <Box flexDirection="column" gap={0}>
      {visibleMessages.map((msg) => {
        const isAgent = msg.type === "agent";
        const isSystem = msg.type === "system";

        return (
          <Box key={msg.id} flexDirection="column">
            <Text>
              <Text
                bold
                color={
                  isAgent
                    ? theme.colors.primary
                    : isSystem
                      ? theme.colors.textDim
                      : theme.colors.secondary
                }
              >
                {isAgent ? "◉ " : isSystem ? "· " : "◆ "}
                {msg.userName.toUpperCase()}
              </Text>
            </Text>
            <Text
              color={
                isAgent
                  ? theme.colors.textBright
                  : isSystem
                    ? theme.colors.textDim
                    : theme.colors.text
              }
              wrap="wrap"
            >
              {"  "}
              {msg.text}
            </Text>
          </Box>
        );
      })}

      {isClaudeRunning && (
        <Box>
          <Text color={theme.colors.warning} bold>
            ◈ CLAUDE PROCESSING...
          </Text>
        </Box>
      )}
    </Box>
  );
}
