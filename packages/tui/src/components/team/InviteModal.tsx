import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useCollab } from "../../app.js";

interface InviteModalProps {
  serverUrl?: string;
  token?: string;
  onClose: () => void;
}

export function InviteModal({ serverUrl, token, onClose }: InviteModalProps) {
  const { roomId } = useCollab();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useInput((_, key) => {
    if (key.escape) {
      onClose();
    }
  });

  useEffect(() => {
    if (!serverUrl || !token || !roomId) {
      setError("Not connected to a room. Use --room <id> when starting.");
      return;
    }

    setLoading(true);
    fetch(`${serverUrl}/api/rooms/${roomId}/invite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data: any) => {
        if (data.inviteCode) {
          setInviteCode(data.inviteCode);
        } else {
          setError(data.error || "Failed to create invite");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [serverUrl, token, roomId]);

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.accent}
      paddingX={2}
      paddingY={1}
      width={50}
    >
      <Text bold color={theme.colors.accent}>
        Invite to Room
      </Text>

      {loading && <Text color={theme.colors.textDim}>Generating invite...</Text>}

      {error && <Text color={theme.colors.error}>{error}</Text>}

      {inviteCode && (
        <Box flexDirection="column" marginTop={1}>
          <Text color={theme.colors.text}>Share this command:</Text>
          <Box marginTop={1}>
            <Text bold color={theme.colors.success}>
              vibewithme --room {roomId} --server {serverUrl}
            </Text>
          </Box>
          <Box marginTop={1}>
            <Text color={theme.colors.textDim}>
              Invite code: <Text color={theme.colors.warning}>{inviteCode}</Text>
            </Text>
            <Text color={theme.colors.textDim}> (expires in 24h)</Text>
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color={theme.colors.textDim}>Esc: close</Text>
      </Box>
    </Box>
  );
}
