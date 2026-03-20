import React from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useChatStore } from "../../store/chat.js";
import { useClaudeStore } from "../../store/claude.js";
import { useClaudeAgent } from "../../hooks/useClaudeAgent.js";

interface ChatInputProps {
  isFocused: boolean;
}

export function ChatInput({ isFocused }: ChatInputProps) {
  const [cursorVisible, setCursorVisible] = React.useState(true);
  const { inputValue, setInputValue, addMessage } = useChatStore();
  const isClaudeRunning = useClaudeStore((s) => s.isRunning);
  const { runAgent, interrupt } = useClaudeAgent();

  // Blink cursor
  React.useEffect(() => {
    if (!isFocused) return;
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, [isFocused]);

  useInput(
    (input, key) => {
      if (!isFocused) return;

      // Escape to interrupt Claude
      if (key.escape && isClaudeRunning) {
        interrupt();
        return;
      }

      // Submit message
      if (key.return && inputValue.trim()) {
        const text = inputValue.trim();
        const isAiMention = text.toLowerCase().startsWith("@ai");

        // Add user message to chat
        addMessage({
          userId: "local",
          userName: "YOU",
          userColor: theme.colors.secondary,
          text,
          type: "user",
          isAiMention,
        });

        setInputValue("");

        // Trigger Claude if @ai and not already running
        if (isAiMention && !isClaudeRunning) {
          runAgent(text);
        }
        return;
      }

      // Backspace
      if (key.backspace || key.delete) {
        setInputValue(inputValue.slice(0, -1));
        return;
      }

      // Regular character input
      if (input && !key.ctrl && !key.meta && !key.escape) {
        setInputValue(inputValue + input);
      }
    },
  );

  return (
    <Box>
      <Text color={isFocused ? theme.colors.primary : theme.colors.textDim}>
        {"►"}{" "}
      </Text>
      <Text color={theme.colors.text}>
        {inputValue}
        {isFocused && cursorVisible ? (
          <Text color={theme.colors.primary} inverse>
            {" "}
          </Text>
        ) : (
          ""
        )}
      </Text>
    </Box>
  );
}
