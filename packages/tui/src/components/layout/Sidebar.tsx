import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { FileTree } from "../workspace/FileTree.js";

const tabs = [
  { id: "files" as const, label: "Files" },
  { id: "secrets" as const, label: "Secrets" },
  { id: "team" as const, label: "Team" },
];

export function Sidebar() {
  const { focusedPanel, sidebarTab, setSidebarTab } = useUIStore();
  const isFocused = focusedPanel === "sidebar";

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={isFocused ? theme.colors.borderFocus : theme.colors.border}
      width={24}
    >
      {/* Tab bar */}
      <Box paddingX={1} gap={1}>
        {tabs.map((tab) => (
          <Text
            key={tab.id}
            bold={sidebarTab === tab.id}
            color={
              sidebarTab === tab.id
                ? theme.colors.primary
                : theme.colors.textDim
            }
          >
            {tab.label}
          </Text>
        ))}
      </Box>

      {/* Tab content */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {sidebarTab === "files" && <FileTree isFocused={isFocused} />}
        {sidebarTab === "secrets" && (
          <Text color={theme.colors.textDim}>No secrets yet</Text>
        )}
        {sidebarTab === "team" && (
          <Box flexDirection="column">
            <Text color={theme.colors.success}>* you (online)</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
