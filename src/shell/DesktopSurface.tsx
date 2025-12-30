import { useUI } from "../state/uiStore";

function clickedInsideProtectedUI(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  // Any window root OR dock/menubar (or anything else you mark protected)
  return Boolean(el.closest("[data-window='true'], [data-no-blur='true']"));
}

export default function DesktopSurface() {
  const clearActiveWindow = useUI((s) => s.clearActiveWindow);

  return (
    <div
      onMouseDown={(e) => {
        // Only unfocus if click is truly on the wallpaper
        if (!clickedInsideProtectedUI(e.target)) clearActiveWindow();
      }}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(1200px 900px at 25% 25%, rgba(154,208,255,0.28), transparent 60%), radial-gradient(900px 700px at 75% 35%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(900px 700px at 50% 85%, rgba(16,185,129,0.14), transparent 60%)",
      }}
    />
  );
}
