import { runCommand } from "./commands";
import { useUI } from "../state/uiStore";

export function bindGlobalShortcuts() {
  const handler = (e: KeyboardEvent) => {
    const ui = useUI.getState();
    const key = e.key.toLowerCase();

    // Cmd+K / Ctrl+K => Spotlight
    if ((e.metaKey || e.ctrlKey) && key === "k") {
      e.preventDefault();
      ui.toggleSpotlight();
      return;
    }

    // Cmd+W => close active window (NOT Launchpad/Spotlight)
    if (e.metaKey && key === "w") {
      // If an overlay is open, don't hijack Cmd+W (keeps behavior predictable)
      if (ui.launchpadOpen || ui.spotlightOpen) return;

      e.preventDefault();
      ui.closeFocusedWindow();
      return;
    }

    // Esc: Launchpad -> Spotlight -> active window
    if (e.key === "Escape") {
      if (ui.launchpadOpen) {
        e.preventDefault();
        runCommand({ type: "CLOSE_LAUNCHPAD" });
        return;
      }

      if (ui.spotlightOpen) {
        e.preventDefault();
        runCommand({ type: "CLOSE_SPOTLIGHT" });
        return;
      }

      // If no overlays, Esc closes the active window (Terminal/Notes/etc)
      e.preventDefault();
      ui.closeFocusedWindow();
      return;
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}
