import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useChatStore } from "../../store/chat.js";

export function MessageList() {
  const { messages, isAgentRunning, agentStreamText } = useChatStore();

  if (messages.length === 0 && !isAgentRunning) {
    return (
      <Box flexDirection="column" gap={1} paddingY={1}>
        <Text color={theme.colors.textDim}>No messages yet.</Text>
        <Text color={theme.colors.textDim}>
          Type a message below to chat.
        </Text>
        <Text color={theme.colors.textDim}>
          Start with <Text bold color={theme.colors.aiBubble}>@ai</Text> to talk to
          Claude.
        </Text>
      </Box>
    );
  }

  // Show last N messages that fit
  const maxMessages = 15;
  const visibleMessages = messages.slice(-maxMessages);

  return (
    <Box flexDirection="column" gap={0}>
      {visibleMessages.map((msg) => (
        <Box key={msg.id} flexDirection="column">
          <Text>
            <Text
              bold
              color={
                msg.type === "agent"
                  ? theme.colors.aiBubble
                  : msg.type === "system"
                    ? theme.colors.systemText
                    : msg.userColor || theme.colors.userBubble
              }
            >
              {msg.type === "agent" ? "# Claude" : msg.type === "system" ? "~ system" : msg.userName}
            </Text>
          </Text>
          <Text color={theme.colors.text} wrap="wrap">
            {msg.text}
          </Text>
        </Box>
      ))}

      {/* Streaming agent response */}
      {isAgentRunning && agentStreamText && (
        <Box flexDirection="column">
          <Text bold color={theme.colors.aiBubble}>
            # Claude
          </Text>
          <Text color={theme.colors.text} wrap="wrap">
            {agentStreamText}
          </Text>
          <Text color={theme.colors.aiBubble}>...</Text>
        </Box>
      )}

      {isAgentRunning && !agentStreamText && (
        <Text color={theme.colors.aiBubble}>Claude is thinking...</Text>
      )}
    </Box>
  );
}
