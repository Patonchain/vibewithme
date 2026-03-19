import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../../theme.js";
import { useSecrets } from "../../hooks/useSecrets.js";

interface SecretFormProps {
  onClose: () => void;
}

export function SecretForm({ onClose }: SecretFormProps) {
  const { addSecret } = useSecrets();
  const [field, setField] = useState<"key" | "value">("key");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  useInput((input, inkKey) => {
    if (inkKey.escape) {
      onClose();
      return;
    }

    if (inkKey.return) {
      if (field === "key" && key.trim()) {
        setField("value");
      } else if (field === "value" && key.trim() && value.trim()) {
        addSecret(key.trim(), value.trim());
        onClose();
      }
      return;
    }

    if (inkKey.backspace || inkKey.delete) {
      if (field === "key") setKey((s) => s.slice(0, -1));
      else setValue((s) => s.slice(0, -1));
      return;
    }

    if (input && !inkKey.ctrl && !inkKey.meta) {
      if (field === "key") setKey((s) => s + input.toUpperCase());
      else setValue((s) => s + input);
    }
  });

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.colors.accent}
      paddingX={2}
      paddingY={1}
    >
      <Text bold color={theme.colors.accent}>
        Add Secret
      </Text>
      <Box>
        <Text color={field === "key" ? theme.colors.primary : theme.colors.textDim}>
          Key:{" "}
        </Text>
        <Text color={theme.colors.text}>
          {key}
          {field === "key" && <Text inverse> </Text>}
        </Text>
      </Box>
      <Box>
        <Text color={field === "value" ? theme.colors.primary : theme.colors.textDim}>
          Val:{" "}
        </Text>
        <Text color={theme.colors.text}>
          {value}
          {field === "value" && <Text inverse> </Text>}
        </Text>
      </Box>
      <Text color={theme.colors.textDim}>Enter: next/save | Esc: cancel</Text>
    </Box>
  );
}
