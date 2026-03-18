import { create } from "zustand";

export type PanelId = "sidebar" | "workspace" | "chat";
export type SidebarTab = "files" | "secrets" | "team";
export type ModalType = "command-palette" | "project-picker" | "invite" | null;

interface UIState {
  focusedPanel: PanelId;
  sidebarTab: SidebarTab;
  modal: ModalType;
  sidebarWidth: number;
  chatWidth: number;
  terminalWidth: number;
  terminalHeight: number;

  setFocusedPanel: (panel: PanelId) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setModal: (modal: ModalType) => void;
  setTerminalSize: (width: number, height: number) => void;
  focusNext: () => void;
  focusPrev: () => void;
}

const panelOrder: PanelId[] = ["sidebar", "workspace", "chat"];

export const useUIStore = create<UIState>((set, get) => ({
  focusedPanel: "chat",
  sidebarTab: "files",
  modal: null,
  sidebarWidth: 24,
  chatWidth: 32,
  terminalWidth: 120,
  terminalHeight: 40,

  setFocusedPanel: (panel) => set({ focusedPanel: panel }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setModal: (modal) => set({ modal }),
  setTerminalSize: (width, height) =>
    set({ terminalWidth: width, terminalHeight: height }),

  focusNext: () => {
    const { focusedPanel } = get();
    const idx = panelOrder.indexOf(focusedPanel);
    const next = panelOrder[(idx + 1) % panelOrder.length];
    set({ focusedPanel: next });
  },
  focusPrev: () => {
    const { focusedPanel } = get();
    const idx = panelOrder.indexOf(focusedPanel);
    const prev = panelOrder[(idx - 1 + panelOrder.length) % panelOrder.length];
    set({ focusedPanel: prev });
  },
}));
