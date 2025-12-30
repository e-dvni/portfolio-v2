import DockAppIcon from "./DockAppIcon";
import { DOCK_APPS } from "../system/appRegistry";

export default function Dock() {
  return (
    <div
      data-no-blur="true"
      style={{
        position: "absolute",
        left: "50%",
        bottom: 14,
        transform: "translateX(-50%)",
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        background: "rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 18,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "var(--shadow)",
        zIndex: 40,
        userSelect: "none",
      }}
    >
      {DOCK_APPS.map((app) => (
        <DockAppIcon key={app.key} app={app} />
      ))}
    </div>
  );
}
