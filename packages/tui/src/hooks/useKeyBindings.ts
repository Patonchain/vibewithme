import { useInput } from "ink";
import { useUIStore } from "../store/ui.js";

export function useKeyBindings() {
  const { setFocusedPanel, focusNext, setModal, modal } = useUIStore();

  useInput((input, key) => {
    // Close modal on Escape
    if (key.escape && modal) {
      setModal(null);
      return;
    }

    // Ctrl+1/2/3 to switch panels
    if (key.ctrl && input === "1") {
      setFocusedPanel("sidebar");
      return;
    }
    if (key.ctrl && input === "2") {
      setFocusedPanel("workspace");
      return;
    }
    if (key.ctrl && input === "3") {
      setFocusedPanel("chat");
      return;
    }

    // Tab to cycle panels (only when not typing in chat)
    if (key.tab && !key.shift) {
      focusNext();
      return;
    }

    // Ctrl+P for command palette
    if (key.ctrl && input === "p") {
      setModal("command-palette");
      return;
    }
  });
}
