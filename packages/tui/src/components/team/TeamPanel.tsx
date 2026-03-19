import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useCollab } from "../../app.js";

interface TeamPanelProps {
  isFocused: boolean;
  onInvite: () => void;
}

export function TeamPanel({ isFocused, onInvite }: TeamPanelProps) {
  const { remoteUsers, connected, roomId } = useCollab();

  useInput(
    (input) => {
      if (!isFocused) return;
      if (input === "i") {
        onInvite();
      }
    },
  );

  return (
    <Box flexDirection="column">
      {/* Connection status */}
      {roomId ? (
        <Text color={connected ? theme.colors.success : theme.colors.error}>
          {connected ? "* Connected" : "x Disconnected"}
        </Text>
      ) : (
        <Text color={theme.colors.textDim}>No room joined</Text>
      )}

      {/* Local user */}
      <Box marginTop={1}>
        <Text bold color={theme.colors.success}>
          * you
        </Text>
        <Text color={theme.colors.textDim}> (owner)</Text>
      </Box>

      {/* Remote users */}
      {remoteUsers.map((user) => {
        const isActive = Date.now() - user.lastActive < 30000;
        return (
          <Box key={user.id}>
            <Text color={isActive ? user.color : theme.colors.textDim}>
              {isActive ? "*" : "~"} {user.name}
            </Text>
            <Text color={theme.colors.textDim}>
              {" "}
              ({user.panel || "idle"})
            </Text>
          </Box>
        );
      })}

      {remoteUsers.length === 0 && roomId && (
        <Text color={theme.colors.textDim}>No one else here yet.</Text>
      )}

      {/* Actions */}
      <Box marginTop={1}>
        <Text color={theme.colors.textDim}>
          <Text bold color={theme.colors.primary}>i</Text>:invite
        </Text>
      </Box>
    </Box>
  );
}
