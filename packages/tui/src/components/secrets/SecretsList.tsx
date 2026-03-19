import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useSecrets } from "../../hooks/useSecrets.js";

interface SecretsListProps {
  isFocused: boolean;
  onAddNew: () => void;
}

export function SecretsList({ isFocused, onAddNew }: SecretsListProps) {
  const { secrets, removeSecret } = useSecrets();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useInput(
    (input, key) => {
      if (!isFocused) return;

      if (key.upArrow || input === "k") {
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
      if (key.downArrow || input === "j") {
        setSelectedIndex((i) => Math.min(secrets.length - 1, i + 1));
      }
      // 'a' to add new
      if (input === "a") {
        onAddNew();
      }
      // 'r' to reveal/hide
      if (input === "r" && secrets[selectedIndex]) {
        setRevealedKey(
          revealedKey === secrets[selectedIndex].key
            ? null
            : secrets[selectedIndex].key,
        );
      }
      // 'd' to delete
      if (input === "d" && secrets[selectedIndex]) {
        removeSecret(secrets[selectedIndex].key);
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
    },
  );

  if (secrets.length === 0) {
    return (
      <Box flexDirection="column" gap={1}>
        <Text color={theme.colors.textDim}>No secrets stored.</Text>
        <Text color={theme.colors.textDim}>
          Press <Text bold color={theme.colors.primary}>a</Text> to add one.
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {secrets.map((secret, i) => {
        const isSelected = i === selectedIndex;
        const isRevealed = revealedKey === secret.key;
        const masked = secret.value.slice(0, 3) + "..." + secret.value.slice(-3);

        return (
          <Box key={secret.key} flexDirection="column">
            <Text
              inverse={isSelected && isFocused}
              bold={isSelected}
              color={isSelected ? theme.colors.textBright : theme.colors.text}
            >
              ! {secret.key}
            </Text>
            <Text color={theme.colors.textDim}>
              {"  "}
              {isRevealed ? secret.value : masked}
            </Text>
          </Box>
        );
      })}
      <Text color={theme.colors.textDim}>
        a:add r:reveal d:delete
      </Text>
    </Box>
  );
}
