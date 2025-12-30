import { useEffect, useRef, useState } from "react";
import { runCommand } from "../system/commands";

const QUICK = [
  { label: "Open Launchpad: About", action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "about" }) },
  { label: "Open Launchpad: Skills", action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "skills" }) },
  { label: "Open Launchpad: Projects", action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "projects" }) },
  { label: "Toggle Theme", action: () => runCommand({ type: "TOGGLE_THEME" }) },
];

export default function SpotlightOverlay() {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = QUICK.filter((x) => x.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) runCommand({ type: "CLOSE_SPOTLIGHT" });
      }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,0.32)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: "fadeIn 120ms ease-out",
        display: "grid",
        placeItems: "start center",
        paddingTop: 90,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "min(720px, calc(100vw - 40px))",
          borderRadius: 18,
          border: "1px solid var(--border)",
          background: "var(--panelSolid)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 14 }}>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search… (Cmd+K)"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "12px 14px",
              color: "var(--fg)",
              outline: "none",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ padding: "0 10px 12px" }}>
          {results.map((r) => (
            <button
              key={r.label}
              onClick={r.action}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                color: "var(--fg)",
                padding: "12px 12px",
                borderRadius: 12,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {r.label}
            </button>
          ))}
          {results.length === 0 && (
            <div style={{ padding: 14, color: "var(--muted)" }}>No matches.</div>
          )}
        </div>
      </div>
    </div>
  );
}
