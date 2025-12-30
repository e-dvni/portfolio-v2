import { runCommand } from "./commands";
import { useUI } from "../state/uiStore";

export function bindGlobalShortcuts() {
  const handler = (e: KeyboardEvent) => {
    // Cmd+K spotlight
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      useUI.getState().toggleSpotlight();
      return;
    }

    // Esc closes launchpad first, then spotlight
    if (e.key === "Escape") {
      const ui = useUI.getState();
      if (ui.launchpadOpen) return runCommand({ type: "CLOSE_LAUNCHPAD" });
      if (ui.spotlightOpen) return runCommand({ type: "CLOSE_SPOTLIGHT" });
    }
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}
