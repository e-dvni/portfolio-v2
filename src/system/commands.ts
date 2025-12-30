import { useUI } from "../state/uiStore";
import { clearURLToRoot, setURLForLaunchpadOpen } from "./urlSync";

export type Command =
  | { type: "OPEN_LAUNCHPAD"; slug?: string }
  | { type: "CLOSE_LAUNCHPAD" }
  | { type: "OPEN_TERMINAL" }
  | { type: "CLOSE_TERMINAL" }
  | { type: "OPEN_NOTES" }
  | { type: "CLOSE_NOTES" }
  | { type: "TOGGLE_THEME" }
  | { type: "OPEN_EXTERNAL"; url: string }
  | { type: "OPEN_SPOTLIGHT" }
  | { type: "CLOSE_SPOTLIGHT" };

export function runCommand(cmd: Command) {
  const ui = useUI.getState();

  const closeSpotlightIfOpen = () => {
    if (useUI.getState().spotlightOpen) useUI.getState().closeSpotlight();
  };

  switch (cmd.type) {
    case "OPEN_LAUNCHPAD": {
      ui.openLaunchpad(cmd.slug);
      setURLForLaunchpadOpen();
      closeSpotlightIfOpen();
      return;
    }

    case "CLOSE_LAUNCHPAD": {
      ui.closeLaunchpad();
      clearURLToRoot();
      return;
    }

    case "OPEN_TERMINAL": {
      ui.openTerminal();
      closeSpotlightIfOpen();
      return;
    }

    case "CLOSE_TERMINAL": {
      ui.closeTerminal();
      return;
    }

    case "OPEN_NOTES": {
      ui.openNotes();
      closeSpotlightIfOpen(); // ✅ you were missing this
      return;
    }

    case "CLOSE_NOTES": {
      ui.closeNotes();
      return;
    }

    case "TOGGLE_THEME": {
      ui.toggleTheme();
      closeSpotlightIfOpen();
      return;
    }

    case "OPEN_EXTERNAL": {
      window.open(cmd.url, "_blank", "noopener,noreferrer");
      closeSpotlightIfOpen();
      return;
    }

    case "OPEN_SPOTLIGHT": {
      ui.openSpotlight();
      return;
    }

    case "CLOSE_SPOTLIGHT": {
      ui.closeSpotlight();
      return;
    }
  }
}
