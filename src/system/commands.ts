import { useUI } from "../state/uiStore";
import { clearURLToRoot, setURLForLaunchpad } from "./urlSync";

export type Command =
  | { type: "OPEN_LAUNCHPAD"; slug?: string }
  | { type: "CLOSE_LAUNCHPAD" }
  | { type: "TOGGLE_THEME" }
  | { type: "OPEN_EXTERNAL"; url: string }
  | { type: "OPEN_SPOTLIGHT" }
  | { type: "CLOSE_SPOTLIGHT" };

export function runCommand(cmd: Command) {
  const ui = useUI.getState();

  switch (cmd.type) {
    case "OPEN_LAUNCHPAD": {
      ui.openLaunchpad(cmd.slug);
      setURLForLaunchpad(cmd.slug || ui.launchpadSlug);
      return;
    }
    case "CLOSE_LAUNCHPAD": {
      ui.closeLaunchpad();
      clearURLToRoot();
      return;
    }
    case "TOGGLE_THEME": {
      ui.toggleTheme();
      return;
    }
    case "OPEN_EXTERNAL": {
      window.open(cmd.url, "_blank", "noopener,noreferrer");
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
