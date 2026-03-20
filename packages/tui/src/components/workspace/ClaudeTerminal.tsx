import React from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useClaudeStore } from "../../store/claude.js";

interface ClaudeTerminalProps {
  isFocused: boolean;
}

export function ClaudeTerminal({ isFocused }: ClaudeTerminalProps) {
  const { isRunning, events, streamingText, currentPrompt } = useClaudeStore();
  const [scrollOffset, setScrollOffset] = React.useState(0);

  useInput((input, key) => {
    if (!isFocused) return;
    if (key.upArrow || input === "k") setScrollOffset((s) => Math.max(0, s - 1));
    if (key.downArrow || input === "j") setScrollOffset((s) => s + 1);
  });

  // Build the terminal lines
  const lines: Array<{ color: string; text: string; bold?: boolean }> = [];

  // Header
  lines.push({
    color: theme.colors.primary,
    text: `╔══ CLAUDE CODE ════════════════════════════`,
    bold: true,
  });
  lines.push({
    color: theme.colors.textDim,
    text: `║ PROMPT: ${currentPrompt.slice(0, 50)}`,
  });
  lines.push({
    color: theme.colors.primary,
    text: `╠════════════════════════════════════════════`,
  });

  // Events
  for (const event of events) {
    switch (event.type) {
      case "thinking":
        lines.push({
          color: theme.colors.warning,
          text: `║ ◈ ${event.content}`,
        });
        break;
      case "tool_start":
        lines.push({
          color: theme.colors.secondary,
          text: `║ ► ${event.toolName}`,
          bold: true,
        });
        // Show tool input on next line, truncated
        const inputLines = event.content.split("\n").slice(0, 3);
        for (const line of inputLines) {
          lines.push({
            color: theme.colors.textDim,
            text: `║   ${line.slice(0, 60)}`,
          });
        }
        break;
      case "tool_result":
        lines.push({
          color: theme.colors.text,
          text: `║ ✓ ${event.content.slice(0, 60)}`,
        });
        break;
      case "error":
        lines.push({
          color: theme.colors.error,
          text: `║ ✗ ERROR: ${event.content}`,
          bold: true,
        });
        break;
      case "complete":
        lines.push({
          color: theme.colors.success,
          text: `║ ✓ ${event.content}`,
          bold: true,
        });
        break;
    }
  }

  // Streaming text
  if (streamingText) {
    lines.push({
      color: theme.colors.primary,
      text: `╠══ RESPONSE ═══════════════════════════════`,
    });
    const responseLines = streamingText.split("\n");
    for (const line of responseLines.slice(-15)) {
      lines.push({
        color: theme.colors.textBright,
        text: `║ ${line.slice(0, 70)}`,
      });
    }
  }

  // Status
  if (isRunning) {
    lines.push({
      color: theme.colors.warning,
      text: `║ ◈ PROCESSING... [Ctrl+C to interrupt]`,
    });
  }

  lines.push({
    color: theme.colors.primary,
    text: `╚════════════════════════════════════════════`,
  });

  // Windowed view
  const maxVisible = 20;
  const visibleLines = lines.slice(scrollOffset, scrollOffset + maxVisible);

  return (
    <Box flexDirection="column">
      {visibleLines.map((line, i) => (
        <Text
          key={scrollOffset + i}
          color={line.color}
          bold={line.bold}
          wrap="truncate"
        >
          {line.text}
        </Text>
      ))}
      {lines.length > maxVisible && (
        <Text color={theme.colors.textDim}>
          {scrollOffset + 1}-{Math.min(scrollOffset + maxVisible, lines.length)} of{" "}
          {lines.length} | j/k scroll
        </Text>
      )}
    </Box>
  );
}
