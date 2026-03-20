import React, { useState, useEffect } from "react";
import { Box, Text } from "ink";
import { theme } from "../../theme.js";
import { useWorkspaceStore } from "../../store/workspace.js";
import { useClaudeStore } from "../../store/claude.js";
import { useCollab } from "../../app.js";

// Animated noise strip for the header bar
function useNoiseTick() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 200);
    return () => clearInterval(interval);
  }, []);
  return tick;
}

function NoiseStrip({ width, tick }: { width: number; tick: number }) {
  const chars = "░▒▓█▒░·";
  const strip = Array.from({ length: width }, (_, i) => {
    const idx = Math.floor(
      (Math.sin(i * 0.7 + tick * 0.4) * 0.5 + 0.5) * chars.length,
    );
    return chars[Math.min(idx, chars.length - 1)];
  }).join("");
  return <Text color={theme.colors.noise}>{strip}</Text>;
}

export function Header() {
  const projectName = useWorkspaceStore((s) => s.projectName);
  const isClaudeRunning = useClaudeStore((s) => s.isRunning);
  const { remoteUsers, connected, roomId } = useCollab();
  const tick = useNoiseTick();

  return (
    <Box flexDirection="column">
      {/* Noise top strip */}
      <Box>
        <NoiseStrip width={80} tick={tick} />
      </Box>

      {/* Main header */}
      <Box paddingX={1} justifyContent="space-between">
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
          {/* Presence */}
          <Text color={theme.colors.success}>◆ YOU</Text>
          {remoteUsers.map((user) => {
            const active = Date.now() - user.lastActive < 30000;
            return (
              <Text key={user.id} color={active ? user.color : theme.colors.textDim}>
                {active ? "◆" : "◇"} {user.name?.toUpperCase()}
              </Text>
            );
          })}

          {/* Claude status */}
          {isClaudeRunning && (
            <Text color={theme.colors.warning} bold>
              ◈ CLAUDE ACTIVE
            </Text>
          )}

          {/* Connection */}
          {roomId && (
            <Text color={connected ? theme.colors.success : theme.colors.error}>
              [{connected ? "LIVE" : "OFFLINE"}]
            </Text>
          )}
        </Box>
      </Box>

      {/* Noise bottom strip */}
      <Box>
        <NoiseStrip width={80} tick={tick + 3} />
      </Box>
    </Box>
  );
}
