import React, { useState } from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useUIStore } from "../../store/ui.js";
import { FileTree } from "../workspace/FileTree.js";
import { SecretsList } from "../secrets/SecretsList.js";
import { SecretForm } from "../secrets/SecretForm.js";
import { TeamPanel } from "../team/TeamPanel.js";

const tabs = [
  { id: "files" as const, label: "Files" },
  { id: "secrets" as const, label: "Secrets" },
  { id: "team" as const, label: "Team" },
];

export function Sidebar() {
  const { focusedPanel, sidebarTab, setSidebarTab, setModal } = useUIStore();
  const isFocused = focusedPanel === "sidebar";
  const [showSecretForm, setShowSecretForm] = useState(false);

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
    </Box>
  );
}
