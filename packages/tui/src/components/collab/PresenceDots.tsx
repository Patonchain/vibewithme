import React from "react";
import { Box, Text } from "ink";
import type { RemoteUser } from "../../hooks/useCollaboration.js";

interface PresenceDotsProps {
  localUserName: string;
  remoteUsers: RemoteUser[];
  connected: boolean;
}

export function PresenceDots({
  localUserName,
  remoteUsers,
  connected,
}: PresenceDotsProps) {
  return (
    <Box gap={1}>
      {/* Local user */}
      <Text color="#a6e3a1">
        * {localUserName}
      </Text>

      {/* Remote users */}
      {remoteUsers.map((user) => {
        const isActive = Date.now() - user.lastActive < 30000;
        return (
          <Text key={user.id} color={isActive ? user.color : "#6c7086"}>
            {isActive ? "*" : "~"} {user.name}
          </Text>
        );
      })}

      {/* Connection indicator */}
      {connected !== undefined && (
        <Text color={connected ? "#a6e3a1" : "#f38ba8"}>
          {connected ? "[live]" : "[offline]"}
        </Text>
      )}
    </Box>
  );
}
