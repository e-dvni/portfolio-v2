import { useState } from "react";
import type { DockApp } from "../system/appRegistry";
import { useUI } from "../state/uiStore";
import { runCommand } from "../system/commands";

const PROFILE = {
  email: "danielslee078@gmail.com",
  githubUrl: "https://www.github.com/e-dvni",
  linkedinUrl: "https://www.linkedin.com/in/daniel-lee-7157a31a8/",
};

export default function DockAppIcon({ app }: { app: DockApp }) {
  const running = useUI((s) => s.running[app.key]);
  const [hover, setHover] = useState(false);

  // Hide Admin until authenticated in later phases
  const isAdmin = useUI((s) => s.isAdmin);
  if (app.key === "admin" && !isAdmin) return null;

  const openGmailCompose = () => {
    const to = encodeURIComponent(PROFILE.email);
    const subject = encodeURIComponent("Portfolio Inquiry");
    const body = encodeURIComponent("Hey Daniel — I checked out your portfolio and...");
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    runCommand({ type: "OPEN_EXTERNAL", url: gmail });
  };

  const onClick = () => {
    if (app.key === "launchpad") {
      if (useUI.getState().launchpadOpen) runCommand({ type: "CLOSE_LAUNCHPAD" });
      else runCommand({ type: "OPEN_LAUNCHPAD", slug: useUI.getState().launchpadSlug });
      return;
    }

    if (app.kind === "external") {
      if (app.key === "mail") {
        openGmailCompose();
        return;
      }

      // Safety: if these are missing in registry for any reason, fall back to profile constants
      if (app.key === "github") {
        runCommand({ type: "OPEN_EXTERNAL", url: app.href || PROFILE.githubUrl });
        return;
      }
      if (app.key === "linkedin") {
        runCommand({ type: "OPEN_EXTERNAL", url: app.href || PROFILE.linkedinUrl });
        return;
      }

      if (app.href) runCommand({ type: "OPEN_EXTERNAL", url: app.href });
      return;
    }

    // window apps (Notes/Admin) later
    alert(`${app.name} (Phase 2/3)`);
  };

  return (
    <div style={{ position: "relative", width: 48 }}>
      {hover && (
        <div
          style={{
            position: "absolute",
            bottom: 62,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.75)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 10,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {app.name}
        </div>
      )}

      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.08)",
          cursor: "pointer",
          color: "var(--fg)",
          fontSize: 16,
        }}
        title={app.name}
      >
        {iconFor(app.key)}
      </button>

      <div style={{ height: 8, display: "grid", placeItems: "center", marginTop: 3 }}>
        {running ? (
          <div style={{ width: 6, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.85)" }} />
        ) : null}
      </div>
    </div>
  );
}

function iconFor(key: string) {
  // simple placeholders; we’ll replace with real icons later
  switch (key) {
    case "launchpad":
      return "⌘";
    case "notes":
      return "🗒";
    case "github":
      return "GH";
    case "linkedin":
      return "in";
    case "mail":
      return "✉";
    case "admin":
      return "⚙";
    default:
      return "•";
  }
}
