import React from "react";
import { Text } from "ink";
import type { RemoteUser } from "../../hooks/useCollaboration.js";

interface RemoteCursorProps {
  user: RemoteUser;
  currentFile: string;
  visibleStartLine: number;
  visibleEndLine: number;
  gutterWidth: number;
}

export function RemoteCursor({
  user,
  currentFile,
  visibleStartLine,
  visibleEndLine,
  gutterWidth,
}: RemoteCursorProps) {
  if (!user.cursor || user.cursor.file !== currentFile) return null;
  if (
    user.cursor.line < visibleStartLine ||
    user.cursor.line > visibleEndLine
  )
    return null;

  return (
    <Text color={user.color}>
      {"  ".repeat(gutterWidth)} {"<"}- {user.name}
    </Text>
  );
}
