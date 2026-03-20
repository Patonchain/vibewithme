import React from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useWorkspaceStore } from "../../store/workspace.js";
import { useFileSystem } from "../../hooks/useFileSystem.js";
import type { FileEntry } from "@vibewithme/shared";

interface FileTreeProps {
  isFocused: boolean;
}

function flattenTree(
  entries: FileEntry[],
  expandedDirs: Set<string>,
  depth: number = 0,
): Array<{ entry: FileEntry; depth: number }> {
  const result: Array<{ entry: FileEntry; depth: number }> = [];
  for (const entry of entries) {
    result.push({ entry, depth });
    if (entry.type === "directory" && entry.children && expandedDirs.has(entry.path)) {
      result.push(...flattenTree(entry.children, expandedDirs, depth + 1));
    }
  }
  return result;
}

export function FileTree({ isFocused }: FileTreeProps) {
  const {
    fileTree,
    expandedDirs,
    selectedIndex,
    toggleDir,
    setSelectedIndex,
    openFile,
  } = useWorkspaceStore();
  const { readFile } = useFileSystem();

  const flatItems = flattenTree(fileTree, expandedDirs);

  useInput((input, key) => {
    if (!isFocused) return;

    // Don't handle number keys (those are for tab switching)
    if ("123".includes(input)) return;

    if (key.upArrow || input === "k") {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
      return;
    }
    if (key.downArrow || input === "j") {
      setSelectedIndex(Math.min(flatItems.length - 1, selectedIndex + 1));
      return;
    }
    if (key.return || input === "l") {
      const item = flatItems[selectedIndex];
      if (!item) return;
      if (item.entry.type === "directory") {
        toggleDir(item.entry.path);
      } else {
        openFile(item.entry.path);
        readFile(item.entry.path);
      }
      return;
    }
    if (input === "h") {
      const item = flatItems[selectedIndex];
      if (item?.entry.type === "directory" && expandedDirs.has(item.entry.path)) {
        toggleDir(item.entry.path);
      }
      return;
    }
  });

  if (flatItems.length === 0) {
    return <Text color={theme.colors.textDim}>EMPTY</Text>;
  }

  const maxVisible = 25;
  const startIdx = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  const visibleItems = flatItems.slice(startIdx, startIdx + maxVisible);

  return (
    <Box flexDirection="column">
      {visibleItems.map(({ entry, depth }, i) => {
        const globalIdx = startIdx + i;
        const isSelected = globalIdx === selectedIndex;
        const isDir = entry.type === "directory";
        const isExpanded = expandedDirs.has(entry.path);

        const icon = isDir ? (isExpanded ? "▾ " : "▸ ") : "  ";
        const indent = "  ".repeat(depth);

        return (
          <Text key={entry.path} wrap="truncate">
            <Text
              color={
                isSelected
                  ? theme.colors.textBright
                  : isDir
                    ? theme.colors.secondary
                    : theme.colors.text
              }
              bold={isSelected}
              inverse={isSelected && isFocused}
            >
              {indent}
              {icon}
              {entry.name}
            </Text>
          </Text>
        );
      })}
      {flatItems.length > maxVisible && (
        <Text color={theme.colors.textDim}>
          [{flatItems.length} items]
        </Text>
      )}
    </Box>
  );
}
