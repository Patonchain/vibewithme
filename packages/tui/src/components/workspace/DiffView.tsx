import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";

interface DiffLine {
  type: "add" | "remove" | "context" | "header";
  content: string;
  lineNum?: number;
}

interface DiffViewProps {
  filePath: string;
  diff: string;
  isFocused: boolean;
  onAccept: () => void;
  onReject: () => void;
}

function parseDiff(diff: string): DiffLine[] {
  const lines: DiffLine[] = [];
  for (const line of diff.split("\n")) {
    if (line.startsWith("@@")) {
      lines.push({ type: "header", content: line });
    } else if (line.startsWith("+")) {
      lines.push({ type: "add", content: line.slice(1) });
    } else if (line.startsWith("-")) {
      lines.push({ type: "remove", content: line.slice(1) });
    } else {
      lines.push({ type: "context", content: line.startsWith(" ") ? line.slice(1) : line });
    }
  }
  return lines;
}

export function DiffView({
  filePath,
  diff,
  isFocused,
  onAccept,
  onReject,
}: DiffViewProps) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const lines = parseDiff(diff);

  useInput(
    (input, key) => {
      if (!isFocused) return;

      if (key.upArrow || input === "k") {
        setScrollOffset((s) => Math.max(0, s - 1));
      }
      if (key.downArrow || input === "j") {
        setScrollOffset((s) => Math.min(lines.length - 1, s + 1));
      }
      // 'y' to accept
      if (input === "y") {
        onAccept();
      }
      // 'n' to reject
      if (input === "n") {
        onReject();
      }
    },
  );

  const maxVisible = 25;
  const visibleLines = lines.slice(scrollOffset, scrollOffset + maxVisible);

  const colorMap = {
    add: theme.colors.success,
    remove: theme.colors.error,
    context: theme.colors.text,
    header: theme.colors.primary,
  };

  const prefixMap = {
    add: "+ ",
    remove: "- ",
    context: "  ",
    header: "",
  };

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box justifyContent="space-between" paddingX={1}>
        <Text bold color={theme.colors.warning}>
          Changes: {filePath.split("/").pop()}
        </Text>
        <Text color={theme.colors.textDim}>
          <Text color={theme.colors.success}>y</Text>:accept{" "}
          <Text color={theme.colors.error}>n</Text>:reject
        </Text>
      </Box>

      {/* Diff lines */}
      {visibleLines.map((line, i) => (
        <Text key={scrollOffset + i} color={colorMap[line.type]} wrap="truncate">
          {prefixMap[line.type]}
          {line.content}
        </Text>
      ))}

      {lines.length > maxVisible && (
        <Text color={theme.colors.textDim}>
          {scrollOffset + 1}-{Math.min(scrollOffset + maxVisible, lines.length)}{" "}
          of {lines.length} lines
        </Text>
      )}
    </Box>
  );
}
