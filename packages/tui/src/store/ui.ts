import { create } from "zustand";

export type PanelId = "sidebar" | "workspace" | "chat";
export type SidebarTab = "files" | "secrets" | "team";
export type ModalType = "command-palette" | "project-picker" | "invite" | null;
export type LayoutPreference = "auto" | "mobile" | "desktop";

interface UIState {
  focusedPanel: PanelId;
  sidebarTab: SidebarTab;
  modal: ModalType;
  sidebarWidth: number;
  chatWidth: number;
  terminalWidth: number;
  terminalHeight: number;
  layoutPreference: LayoutPreference;

  setFocusedPanel: (panel: PanelId) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setModal: (modal: ModalType) => void;
  setTerminalSize: (width: number, height: number) => void;
  setLayoutPreference: (pref: LayoutPreference) => void;
  focusNext: () => void;
  focusPrev: () => void;
  isMobile: () => boolean;
}

const panelOrder: PanelId[] = ["sidebar", "workspace", "chat"];

/** Portrait / phone: narrow column or taller than wide. */
export function detectMobile(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false;
  return width < 80 || width < height;
}

export const useUIStore = create<UIState>((set, get) => ({
  focusedPanel: "chat",
  sidebarTab: "files",
  modal: null,
  sidebarWidth: 24,
  chatWidth: 32,
  terminalWidth: 120,
  terminalHeight: 40,
  layoutPreference: "auto",

  setFocusedPanel: (panel) => set({ focusedPanel: panel }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setModal: (modal) => set({ modal }),
  setTerminalSize: (width, height) =>
    set({ terminalWidth: width, terminalHeight: height }),
  setLayoutPreference: (pref) => set({ layoutPreference: pref }),

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
  isMobile: () => {
    const { layoutPreference, terminalWidth, terminalHeight } = get();
    if (layoutPreference === "mobile") return true;
    if (layoutPreference === "desktop") return false;
    return detectMobile(terminalWidth, terminalHeight);
  },
}));
