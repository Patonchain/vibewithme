import React from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useWorkspaceStore } from "../../store/workspace.js";

interface FileViewerProps {
  isFocused: boolean;
}

export function FileViewer({ isFocused }: FileViewerProps) {
  const { fileContent, activeFile } = useWorkspaceStore();
  const [scrollOffset, setScrollOffset] = React.useState(0);

  React.useEffect(() => {
    setScrollOffset(0);
  }, [activeFile]);

  useInput((input, key) => {
    if (!isFocused) return;
    if (key.upArrow || input === "k") setScrollOffset((s) => Math.max(0, s - 1));
    if (key.downArrow || input === "j") setScrollOffset((s) => s + 1);
    if (input === "d" && key.ctrl) setScrollOffset((s) => s + 15);
    if (input === "u" && key.ctrl) setScrollOffset((s) => Math.max(0, s - 15));
  });

  if (!fileContent) {
    return <Text color={theme.colors.textDim}>LOADING...</Text>;
  }

  const lines = fileContent.split("\n");
  const maxVisible = 30;
  const visibleLines = lines.slice(scrollOffset, scrollOffset + maxVisible);
  const gutterWidth = String(lines.length).length;

  return (
    <Box flexDirection="column">
      {visibleLines.map((line, i) => {
        const lineNum = scrollOffset + i + 1;
        return (
          <Text key={lineNum} wrap="truncate">
            <Text color={theme.colors.textDim}>
              {String(lineNum).padStart(gutterWidth, " ")}
            </Text>
            <Text color={theme.colors.border}> │ </Text>
            <Text color={theme.colors.text}>{line}</Text>
          </Text>
        );
      })}
      {lines.length > maxVisible && (
        <Text color={theme.colors.textDim}>
          L{scrollOffset + 1}-{Math.min(scrollOffset + maxVisible, lines.length)}/{lines.length} | j/k ^D/^U
        </Text>
      )}
    </Box>
  );
}
