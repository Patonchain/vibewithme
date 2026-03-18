import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useChatStore } from "../../store/chat.js";

interface ChatInputProps {
  isFocused: boolean;
}

export function ChatInput({ isFocused }: ChatInputProps) {
  const [cursorVisible, setCursorVisible] = React.useState(true);
  const { inputValue, setInputValue, addMessage, isAgentRunning } =
    useChatStore();

  // Blink cursor
  React.useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, [isFocused]);

  useInput(
    (input, key) => {
      if (!isFocused) return;

      if (key.return && inputValue.trim()) {
        const text = inputValue.trim();
        const isAiMention = text.toLowerCase().startsWith("@ai");

        addMessage({
          userId: "local",
          userName: "you",
          userColor: theme.colors.userBubble,
          text,
          type: "user",
          isAiMention,
        });

        setInputValue("");

        // If @ai, we'd trigger Claude here (Phase 2)
        if (isAiMention && !isAgentRunning) {
          // TODO: trigger Claude Agent SDK
          addMessage({
            userId: "system",
            userName: "system",
            userColor: theme.colors.systemText,
            text: "Claude Agent integration coming in the next build!",
            type: "system",
          });
        }
        return;
      }

      if (key.backspace || key.delete) {
        setInputValue(inputValue.slice(0, -1));
        return;
      }

      // Regular character input
      if (input && !key.ctrl && !key.meta) {
        setInputValue(inputValue + input);
      }
    },
  );

  return (
    <Box>
      <Text color={isFocused ? theme.colors.primary : theme.colors.textDim}>
        {">"}{" "}
      </Text>
      <Text color={theme.colors.text}>
        {inputValue}
        {isFocused && cursorVisible ? (
          <Text inverse> </Text>
        ) : (
          ""
        )}
      </Text>
    </Box>
  );
}
