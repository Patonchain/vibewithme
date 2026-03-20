import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useUIStore, type SidebarTab } from "../../store/ui.js";
import { FileTree } from "../workspace/FileTree.js";
import { SecretsList } from "../secrets/SecretsList.js";
import { SecretForm } from "../secrets/SecretForm.js";
import { TeamPanel } from "../team/TeamPanel.js";

const tabs: Array<{ id: SidebarTab; label: string; key: string }> = [
  { id: "files", label: "FILES", key: "1" },
  { id: "secrets", label: "SECRETS", key: "2" },
  { id: "team", label: "TEAM", key: "3" },
];

export function Sidebar() {
  const { focusedPanel, sidebarTab, setSidebarTab, setModal } = useUIStore();
  const isFocused = focusedPanel === "sidebar";
  const [showSecretForm, setShowSecretForm] = useState(false);

  // Tab switching with number keys when sidebar is focused
  useInput((input) => {
    if (!isFocused) return;
    for (const tab of tabs) {
      if (input === tab.key) {
        setSidebarTab(tab.id);
        return;
      }
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={isFocused ? theme.colors.primary : theme.colors.border}
      width={26}
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
            {sidebarTab === tab.id ? "►" : " "}
            {tab.label}
          </Text>
        ))}
      </Box>

      {/* Separator */}
      <Box paddingX={0}>
        <Text color={theme.colors.border}>
          {"─".repeat(24)}
        </Text>
      </Box>

      {/* Tab content */}
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        {sidebarTab === "files" && <FileTree isFocused={isFocused} />}
        {sidebarTab === "secrets" && !showSecretForm && (
          <SecretsList
            isFocused={isFocused}
            onAddNew={() => setShowSecretForm(true)}
          />
        )}
        {sidebarTab === "secrets" && showSecretForm && (
          <SecretForm onClose={() => setShowSecretForm(false)} />
        )}
        {sidebarTab === "team" && (
          <TeamPanel
            isFocused={isFocused}
            onInvite={() => setModal("invite")}
          />
        )}
      </Box>

      {/* Sidebar footer hint */}
      {isFocused && (
        <Box paddingX={1}>
          <Text color={theme.colors.textDim}>
            1/2/3:tab j/k:nav
          </Text>
        </Box>
      )}
    </Box>
  );
}
