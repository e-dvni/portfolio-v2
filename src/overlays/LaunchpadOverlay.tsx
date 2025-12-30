import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useUI } from "../state/uiStore";
import { runCommand } from "../system/commands";
import { PROFILE } from "../config/profile";

type Slide = {
  slug: string;
  title: string;
  content: ReactNode;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function isInteractiveTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  // Any of these should NOT close launchpad when clicked
  return Boolean(
    el.closest(
      [
        "button",
        "a",
        "input",
        "textarea",
        "select",
        "[role='button']",
        "[role='link']",
        "[contenteditable='true']",
        "[data-no-close='true']",
      ].join(",")
    )
  );
}

export default function LaunchpadOverlay() {
  const slug = useUI((s) => s.launchpadSlug);
  const setSlug = useUI((s) => s.openLaunchpad);

  const slides: Slide[] = useMemo(
    () => [
      { slug: "about", title: "About Me", content: <AboutSlide /> },
      { slug: "skills", title: "Skills", content: <SkillsSlide /> },
      { slug: "education", title: "Education", content: <EducationSlide /> },
      { slug: "projects", title: "Projects", content: <ProjectsSlide /> },
      { slug: "contact", title: "Contact", content: <ContactSlide /> },
    ],
    []
  );

  const activeIndexFromSlug = Math.max(0, slides.findIndex((s) => s.slug === slug));
  const [index, setIndex] = useState(activeIndexFromSlug);

  // Sync internal index when slug changes externally (terminal/menu)
  useEffect(() => {
    setIndex(activeIndexFromSlug);
  }, [activeIndexFromSlug]);

  const goTo = (nextIndex: number) => {
    const bounded = clamp(nextIndex, 0, slides.length - 1);
    setIndex(bounded);
    const next = slides[bounded];
    if (next && next.slug !== slug) setSlug(next.slug);
  };

  const goToSlug = (nextSlug: string) => {
    const idx = slides.findIndex((s) => s.slug === nextSlug);
    if (idx >= 0) goTo(idx);
  };

  // Esc closes, arrows navigate
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") runCommand({ type: "CLOSE_LAUNCHPAD" });
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // ✅ Close on ANY click that isn't interactive
  const onOverlayMouseDown = (e: React.MouseEvent) => {
    if (isInteractiveTarget(e.target)) return;
    runCommand({ type: "CLOSE_LAUNCHPAD" });
  };

  const active = slides[index] ?? slides[0];

  return (
    <div
      onMouseDown={onOverlayMouseDown}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 60,
        background: "rgba(0,0,0,0.38)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        animation: "fadeIn 160ms ease-out",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateRows: "auto 1fr",
          padding: "54px 18px 140px",
        }}
      >
        {/* Directory Bar */}
        <div
          style={{
            width: "min(980px, calc(100vw - 40px))",
            margin: "0 auto 14px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.22)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button onClick={() => goTo(index - 1)} disabled={index === 0} title="Previous (←)" style={navBtn(index === 0)}>
            ←
          </button>

          <button
            onClick={() => goTo(index + 1)}
            disabled={index === slides.length - 1}
            title="Next (→)"
            style={navBtn(index === slides.length - 1)}
          >
            →
          </button>

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.10)", margin: "0 6px" }} />

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 220 }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 650 }}>Launchpad</div>
            <div style={{ color: "rgba(255,255,255,0.35)" }}>/</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{active.title}</div>
          </div>

          {/* Tabs */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {slides.map((s) => {
              const isActive = s.slug === active.slug;
              return (
                <button
                  key={s.slug}
                  onClick={() => goToSlug(s.slug)}
                  style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: isActive ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.90)",
                    borderRadius: 999,
                    padding: "7px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    letterSpacing: 0.2,
                  }}
                  title={`Go to ${s.title}`}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div style={{ display: "grid", placeItems: "center" }}>
          <div
            style={{
              width: "min(980px, calc(100vw - 40px))",
              borderRadius: 22,
              border: "1px solid var(--border)",
              background: "var(--panel)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "var(--shadow)",
              padding: 22,
              animation: "fadeIn 140ms ease-out",
            }}
          >
            {active.content}
          </div>
        </div>
      </div>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 84,
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          padding: "8px 12px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.22)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 70,
        }}
      >
        {slides.map((s, i) => {
          const isActive = i === index;
          return (
            <button
              key={s.slug}
              onClick={() => goTo(i)}
              title={s.title}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.30)",
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "transform 140ms ease, background 140ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function navBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 34,
    height: 28,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: disabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.10)",
    color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
    cursor: disabled ? "not-allowed" : "pointer",
    display: "grid",
    placeItems: "center",
    fontSize: 16,
  };
}

/* Slides */

function AboutSlide() {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 16, lineHeight: 1.5 }}>Daniel Lee — building interactive, high-polish web experiences.</div>
      <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        Use the Dock, Cmd+K Spotlight, or the Terminal (coming soon) to jump anywhere instantly.
      </div>
    </div>
  );
}

function SkillsSlide() {
  return <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>Skills page placeholder — next phase we’ll add progress bars + hover tooltips.</div>;
}

function EducationSlide() {
  return <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>Education placeholder — next phase we’ll lay out a single-screen education card.</div>;
}

function ProjectsSlide() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 600 }}>Custom LED Builder</div>
      <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        Live Shopify-based custom text builder with fonts, live preview, dynamic sizing, and pricing logic.
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={btnStyle} onClick={() => window.open(PROFILE.ledBuilderUrl, "_blank", "noopener,noreferrer")}>
          View Live Site
        </button>
        <button style={btnGhostStyle} disabled title="No repo for this project (built on Shopify)">
          View Repo (N/A)
        </button>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: "8px 0" }} />

      <div style={{ fontWeight: 600 }}>This Portfolio</div>
      <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>macOS-style portfolio experience with Launchpad, Spotlight, and Terminal navigation.</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={btnStyle} onClick={() => window.open(PROFILE.portfolioRepoUrl, "_blank", "noopener,noreferrer")}>
          View Repo
        </button>
      </div>
    </div>
  );
}

function ContactSlide() {
  const openGmailCompose = () => {
    const to = encodeURIComponent(PROFILE.email);
    const subject = encodeURIComponent("Portfolio Inquiry");
    const body = encodeURIComponent("Hey Daniel — I checked out your portfolio and...");
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(gmail, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ color: "var(--muted)" }}>Email:</div>
      <div style={{ fontSize: 16 }}>{PROFILE.email}</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={btnStyle} onClick={openGmailCompose}>
          Open Gmail Compose
        </button>
        <button style={btnGhostStyle} onClick={() => navigator.clipboard.writeText(PROFILE.email)}>
          Copy Email
        </button>
        <button style={btnGhostStyle} onClick={() => window.open(PROFILE.githubUrl, "_blank", "noopener,noreferrer")}>
          GitHub
        </button>
        <button style={btnGhostStyle} onClick={() => window.open(PROFILE.linkedinUrl, "_blank", "noopener,noreferrer")}>
          LinkedIn
        </button>
      </div>

      <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.5 }}>Not using Gmail? Copy my email and send a message from any client.</div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.14)",
  color: "var(--fg)",
  borderRadius: 12,
  padding: "10px 12px",
  cursor: "pointer",
};

const btnGhostStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--fg)",
  borderRadius: 12,
  padding: "10px 12px",
  cursor: "pointer",
};
