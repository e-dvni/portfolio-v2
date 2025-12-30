import MenuBar from "./MenuBar";
import Dock from "./Dock";
import DesktopSurface from "./DesktopSurface";
import LaunchpadOverlay from "../overlays/LaunchpadOverlay";
import SpotlightOverlay from "../overlays/SpotlightOverlay";
import WindowHost from "./WindowHost";
import { useUI } from "../state/uiStore";

function isInteractiveTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  // clicks inside windows / UI elements should NOT clear focus
  return Boolean(
    el.closest(
      [
        "[data-window='true']",
        "[data-overlay='true']",
        "button",
        "a",
        "input",
        "textarea",
        "select",
        "[role='button']",
        "[role='link']",
        "[role='menuitem']",
      ].join(",")
    )
  );
}

export default function DesktopShell() {
  const launchpadOpen = useUI((s) => s.launchpadOpen);
  const spotlightOpen = useUI((s) => s.spotlightOpen);

  // optional: if you want “clicking the desktop unfocuses windows”
  const clearActiveWindow = useUI((s) => s.clearActiveWindow);

  return (
    <div
      style={{ height: "100vh", width: "100vw", position: "relative", overflow: "hidden" }}
      onMouseDown={(e) => {
        // Don’t do anything if Launchpad/Spotlight are open (they handle their own closing rules)
        if (launchpadOpen || spotlightOpen) return;

        // If the click was NOT on an interactive element, treat it as a desktop click → clear focus
        if (!isInteractiveTarget(e.target)) clearActiveWindow();
      }}
    >
      <DesktopSurface />
      <MenuBar />
      <Dock />

      {launchpadOpen && <LaunchpadOverlay />}
      {spotlightOpen && <SpotlightOverlay />}

      <WindowHost />
    </div>
  );
}
