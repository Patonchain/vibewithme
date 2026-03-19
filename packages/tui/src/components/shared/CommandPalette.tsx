import React, { useState, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useWorkspaceStore } from "../../store/workspace.js";
import { useUIStore } from "../../store/ui.js";
import { useFileSystem } from "../../hooks/useFileSystem.js";
import type { FileEntry } from "@vibewithme/shared";

function flattenFiles(
  entries: FileEntry[],
  prefix: string = "",
): Array<{ name: string; path: string }> {
  const result: Array<{ name: string; path: string }> = [];
  for (const entry of entries) {
    const displayPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.type === "file") {
      result.push({ name: displayPath, path: entry.path });
    }
    if (entry.type === "directory" && entry.children) {
      result.push(...flattenFiles(entry.children, displayPath));
    }
  }
  return result;
}

interface CommandItem {
  id: string;
  label: string;
  type: "file" | "action";
  action: () => void;
}

interface CommandPaletteProps {
  onClose: () => void;
}

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileTree = useWorkspaceStore((s) => s.fileTree);
  const { openFile } = useWorkspaceStore();
  const { readFile } = useFileSystem();
  const { setFocusedPanel, setSidebarTab } = useUIStore();

  const items = useMemo<CommandItem[]>(() => {
    // Built-in actions
    const actions: CommandItem[] = [
      {
        id: "cmd:files",
        label: "> Show Files",
        type: "action",
        action: () => {
          setFocusedPanel("sidebar");
          setSidebarTab("files");
        },
      },
      {
        id: "cmd:secrets",
        label: "> Show Secrets",
        type: "action",
        action: () => {
          setFocusedPanel("sidebar");
          setSidebarTab("secrets");
        },
      },
      {
        id: "cmd:team",
        label: "> Show Team",
        type: "action",
        action: () => {
          setFocusedPanel("sidebar");
          setSidebarTab("team");
        },
      },
      {
        id: "cmd:chat",
        label: "> Focus Chat",
        type: "action",
        action: () => setFocusedPanel("chat"),
      },
      {
        id: "cmd:editor",
        label: "> Focus Editor",
        type: "action",
        action: () => setFocusedPanel("workspace"),
      },
    ];

    // Files from file tree
    const files = flattenFiles(fileTree).map((f) => ({
      id: `file:${f.path}`,
      label: f.name,
      type: "file" as const,
      action: () => {
        openFile(f.path);
        readFile(f.path);
        setFocusedPanel("workspace");
      },
    }));

    return [...actions, ...files];
  }, [fileTree, openFile, readFile, setFocusedPanel, setSidebarTab]);

  const filtered = useMemo(() => {
    if (!query) return items.slice(0, 15);
    const q = query.toLowerCase();
    return items
      .filter((item) => {
        // Fuzzy match: check if all query chars appear in order
        let idx = 0;
        const label = item.label.toLowerCase();
        for (const char of q) {
          idx = label.indexOf(char, idx);
          if (idx === -1) return false;
          idx++;
        }
        return true;
      })
      .slice(0, 15);
  }, [items, query]);

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (key.downArrow) {
      setSelectedIndex((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }

    if (key.return && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      onClose();
      return;
    }

    if (key.backspace || key.delete) {
      setQuery((s) => s.slice(0, -1));
      setSelectedIndex(0);
      return;
    }

    if (input && !key.ctrl && !key.meta) {
      setQuery((s) => s + input);
      setSelectedIndex(0);
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.accent}
      paddingX={2}
      paddingY={1}
      width={60}
    >
      {/* Search input */}
      <Box>
        <Text color={theme.colors.accent}>{">"} </Text>
        <Text color={theme.colors.text}>
          {query}
          <Text inverse> </Text>
        </Text>
      </Box>

      {/* Results */}
      <Box flexDirection="column" marginTop={1}>
        {filtered.map((item, i) => (
          <Text
            key={item.id}
            inverse={i === selectedIndex}
            color={
              i === selectedIndex
                ? theme.colors.textBright
                : item.type === "action"
                  ? theme.colors.primary
                  : theme.colors.text
            }
          >
            {item.type === "action" ? "" : "  "}{item.label}
          </Text>
        ))}
        {filtered.length === 0 && (
          <Text color={theme.colors.textDim}>No matches</Text>
        )}
      </Box>

      <Text color={theme.colors.textDim}>
        Esc: close | Enter: select
      </Text>
    </Box>
  );
}
