import { useMemo, useState } from "react";
import { runCommand } from "../system/commands";

const MENU_ITEMS = [
  { label: "About Me", slug: "about" },
  { label: "Skills", slug: "skills" },
  { label: "Education", slug: "education" },
  { label: "Projects", slug: "projects" },
  { label: "Contact", slug: "contact" },
  { label: "Resume", slug: "resume" },
];

export default function MenuBar() {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => MENU_ITEMS, []);

  return (
    <div
      data-no-blur="true"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 34,
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        gap: 10,
        background: "rgba(0,0,0,0.18)",
        borderBottom: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 50,
        userSelect: "none",
      }}
    >
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--fg)",
            fontSize: 13,
            padding: "6px 8px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Edvni Portfolio
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: 34,
              left: 0,
              minWidth: 220,
              background: "var(--panelSolid)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "var(--shadow)",
              padding: 6,
              animation: "pop 160ms ease-out",
            }}
          >
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => {
                  setOpen(false);
                  runCommand({ type: "OPEN_LAUNCHPAD", slug: it.slug });
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 10px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  color: "var(--fg)",
                  fontSize: 13,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {it.label}
              </button>
            ))}

            <div style={{ height: 1, background: "var(--border)", margin: "6px 6px" }} />

            <button
              onClick={() => {
                setOpen(false);
                runCommand({ type: "OPEN_EXTERNAL", url: "https://github.com/e-dvni" });
              }}
              style={menuActionStyle}
            >
              GitHub
            </button>

            <button
              onClick={() => {
                setOpen(false);
                runCommand({ type: "OPEN_EXTERNAL", url: "https://www.linkedin.com/in/daniel-lee-7157a31a8/" });
              }}
              style={menuActionStyle}
            >
              LinkedIn
            </button>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={() => runCommand({ type: "TOGGLE_THEME" })}
        title="Toggle Light/Dark"
        style={iconButtonStyle}
      >
        ◐
      </button>

      <button
        onClick={() => runCommand({ type: "OPEN_SPOTLIGHT" })}
        title="Spotlight (Cmd+K)"
        style={iconButtonStyle}
      >
        ⌘K
      </button>
    </div>
  );
}

const iconButtonStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.16)",
  color: "var(--fg)",
  borderRadius: 10,
  padding: "6px 10px",
  fontSize: 12,
  cursor: "pointer",
};

const menuActionStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "10px 10px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "transparent",
  color: "var(--fg)",
  fontSize: 13,
};
