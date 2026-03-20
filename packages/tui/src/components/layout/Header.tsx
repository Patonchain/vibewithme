import React from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useWorkspaceStore } from "../../store/workspace.js";
import { useClaudeStore } from "../../store/claude.js";
import { useCollab } from "../../app.js";
import { NoisePanel } from "../shared/NoisePanel.js";

export function Header() {
  const projectName = useWorkspaceStore((s) => s.projectName);
  const isClaudeRunning = useClaudeStore((s) => s.isRunning);
  const { remoteUsers, connected, roomId } = useCollab();

  const statusLine = (
    <Box justifyContent="space-between" width="100%">
      <Box gap={1}>
        <Text bold color={theme.colors.primary}>
          ◉ VIBEWITHME
        </Text>
        <Text color={theme.colors.textDim}>║</Text>
        <Text color={theme.colors.secondary}>
          {projectName || "NO PROJECT"}
        </Text>
        {roomId && (
          <>
            <Text color={theme.colors.textDim}>║</Text>
            <Text color={theme.colors.textDim}>ROOM:{roomId}</Text>
          </>
        )}
      </Box>
      <Box gap={1}>
        <Text color={theme.colors.success}>◆ YOU</Text>
        {remoteUsers.map((user) => {
          const active = Date.now() - user.lastActive < 30000;
          return (
            <Text key={user.id} color={active ? user.color : theme.colors.textDim}>
              {active ? "◆" : "◇"} {user.name?.toUpperCase()}
            </Text>
          );
        })}
        {isClaudeRunning && (
          <Text color={theme.colors.warning} bold>◈ CLAUDE</Text>
        )}
        {roomId && (
          <Text color={connected ? theme.colors.success : theme.colors.error}>
            [{connected ? "LIVE" : "OFFLINE"}]
          </Text>
        )}
      </Box>
    </Box>
  );

  return (
    <NoisePanel cols={80} rows={3} pattern="heavyNoise">
      {statusLine}
    </NoisePanel>
  );
}
