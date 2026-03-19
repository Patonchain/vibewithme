import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useWorkspaceStore } from "../../store/workspace.js";
import { useCollab } from "../../app.js";

export function Header() {
  const projectName = useWorkspaceStore((s) => s.projectName);
  const { connected, remoteUsers, roomId } = useCollab();

  return (
    <Box
      borderStyle="single"
      borderColor={theme.colors.border}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={1}>
        <Text bold color={theme.colors.accent}>
          vibewithme
        </Text>
        <Text color={theme.colors.textDim}>|</Text>
        <Text color={theme.colors.text}>{projectName || "no project"}</Text>
        {roomId && (
          <>
            <Text color={theme.colors.textDim}>|</Text>
            <Text color={theme.colors.textDim}>room: {roomId}</Text>
          </>
        )}
      </Box>
      <Box gap={1}>
        {/* Local user */}
        <Text color={theme.colors.success}>* you</Text>

        {/* Remote users */}
        {remoteUsers.map((user) => {
          const isActive = Date.now() - user.lastActive < 30000;
          return (
            <Text key={user.id} color={isActive ? user.color : theme.colors.textDim}>
              {isActive ? "*" : "~"} {user.name}
            </Text>
          );
        })}

        {/* Connection status */}
        {roomId && (
          <Text color={connected ? theme.colors.success : theme.colors.error}>
            {connected ? "[live]" : "[offline]"}
          </Text>
        )}

        <Text color={theme.colors.textDim}>v0.1.0</Text>
      </Box>
    </Box>
  );
}
