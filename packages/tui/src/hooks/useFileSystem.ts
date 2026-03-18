import { useCallback } from "react";
import fs from "node:fs";
import path from "node:path";
import type { FileEntry } from "@vibewithme/shared";
import { useWorkspaceStore } from "../store/workspace.js";

const IGNORED = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "dist",
  ".DS_Store",
  "coverage",
  ".env",
  ".env.local",
]);

function readDir(dirPath: string, depth: number = 0): FileEntry[] {
  if (depth > 3) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const result: FileEntry[] = [];

    // Directories first, then files, both alphabetical
    const dirs = entries
      .filter((e) => e.isDirectory() && !IGNORED.has(e.name) && !e.name.startsWith("."))
      .sort((a, b) => a.name.localeCompare(b.name));

    const files = entries
      .filter((e) => e.isFile() && !IGNORED.has(e.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const dir of dirs) {
      const fullPath = path.join(dirPath, dir.name);
      result.push({
        name: dir.name,
        path: fullPath,
        type: "directory",
        children: readDir(fullPath, depth + 1),
      });
    }

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);
      result.push({
        name: file.name,
        path: fullPath,
        type: "file",
        extension: path.extname(file.name).slice(1),
      });
    }

    return result;
  } catch {
    return [];
  }
}

export function useFileSystem() {
  const { projectPath, setFileTree, setFileContent, setProjectName } =
    useWorkspaceStore();

  const loadProject = useCallback(
    (projectDir?: string) => {
      const dir = projectDir ?? projectPath;
      if (!dir) return;
      useWorkspaceStore.getState().setProjectPath(dir);
      const name = path.basename(dir);
      setProjectName(name);
      const tree = readDir(dir);
      setFileTree(tree);
    },
    [projectPath, setFileTree, setProjectName],
  );

  const readFile = useCallback(
    (filePath: string) => {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        setFileContent(content);
      } catch {
        setFileContent("Error: Could not read file");
      }
    },
    [setFileContent],
  );

  return { loadProject, readFile };
}
