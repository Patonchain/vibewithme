import React from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useChatStore } from "../../store/chat.js";
import { useClaudeAgent } from "../../hooks/useClaudeAgent.js";

interface ChatInputProps {
  isFocused: boolean;
}

export function ChatInput({ isFocused }: ChatInputProps) {
  const [cursorVisible, setCursorVisible] = React.useState(true);
  const { inputValue, setInputValue, addMessage, isAgentRunning } =
    useChatStore();
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

      // Ctrl+C interrupts running agent
      if (key.ctrl && input === "c" && isAgentRunning) {
        interrupt();
        return;
      }

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

        // Trigger Claude Agent SDK
        if (isAiMention && !isAgentRunning) {
          runAgent(text);
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
