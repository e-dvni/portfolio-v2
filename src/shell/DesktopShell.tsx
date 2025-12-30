import MenuBar from "./MenuBar";
import Dock from "./Dock";
import DesktopSurface from "./DesktopSurface";
import LaunchpadOverlay from "../overlays/LaunchpadOverlay";
import SpotlightOverlay from "../overlays/SpotlightOverlay";
import { useUI } from "../state/uiStore";

export default function DesktopShell() {
  const launchpadOpen = useUI((s) => s.launchpadOpen);
  const spotlightOpen = useUI((s) => s.spotlightOpen);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative", overflow: "hidden" }}>
      <DesktopSurface />
      <MenuBar />
      <Dock />
      {launchpadOpen && <LaunchpadOverlay />}
      {spotlightOpen && <SpotlightOverlay />}
    </div>
  );
}
