import { create } from "zustand";
import type { FileEntry } from "@vibewithme/shared";

interface WorkspaceState {
  projectPath: string;
  projectName: string;
  fileTree: FileEntry[];
  activeFile: string | null;
  fileContent: string | null;
  openFiles: string[];
  expandedDirs: Set<string>;
  selectedIndex: number;

  setProjectPath: (path: string) => void;
  setProjectName: (name: string) => void;
  setFileTree: (tree: FileEntry[]) => void;
  setActiveFile: (path: string | null) => void;
  setFileContent: (content: string | null) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  toggleDir: (path: string) => void;
  setSelectedIndex: (index: number) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projectPath: process.cwd(),
  projectName: "",
  fileTree: [],
  activeFile: null,
  fileContent: null,
  openFiles: [],
  expandedDirs: new Set<string>(),
  selectedIndex: 0,

  setProjectPath: (path) => set({ projectPath: path }),
  setProjectName: (name) => set({ projectName: name }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setActiveFile: (path) => set({ activeFile: path }),
  setFileContent: (content) => set({ fileContent: content }),
  openFile: (path) => {
    const { openFiles } = get();
    if (!openFiles.includes(path)) {
      set({ openFiles: [...openFiles, path], activeFile: path });
    } else {
      set({ activeFile: path });
    }
  },
  closeFile: (path) => {
    const { openFiles, activeFile } = get();
    const next = openFiles.filter((f) => f !== path);
    set({
      openFiles: next,
      activeFile: activeFile === path ? next[next.length - 1] ?? null : activeFile,
    });
  },
  toggleDir: (path) => {
    const { expandedDirs } = get();
    const next = new Set(expandedDirs);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    set({ expandedDirs: next });
  },
  setSelectedIndex: (index) => set({ selectedIndex: index }),
}));
