import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useUI } from "../state/uiStore";
import { runCommand } from "../system/commands";
import { setURLForLaunchpad } from "../system/urlSync";

const PROFILE = {
  email: "danielslee078@gmail.com",
  githubUrl: "https://www.github.com/e-dvni",
  linkedinUrl: "https://www.linkedin.com/in/daniel-lee-7157a31a8/",
  // Update these when ready:
  ledBuilderUrl: "https://example.com",
  portfolioRepoUrl: "https://www.github.com/e-dvni",
};

type Slide = {
  slug: string;
  title: string;
  content: ReactNode;
};

export default function LaunchpadOverlay() {
  const slug = useUI((s) => s.launchpadSlug);
  const setSlug = useUI((s) => s.openLaunchpad); // sets slug + persists
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollEndTimer = useRef<number | null>(null);

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

  const idx = Math.max(0, slides.findIndex((s) => s.slug === slug));

  useEffect(() => {
    // snap scroll to active slide
    const el = containerRef.current;
    if (!el) return;

    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
    setURLForLaunchpad(slides[idx]?.slug || "about");
  }, [idx, slides]);

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
    };
  }, []);

  const onBackgroundClick = (e: React.MouseEvent) => {
    // close when clicking the overlay background (not the card)
    if (e.target === e.currentTarget) runCommand({ type: "CLOSE_LAUNCHPAD" });
  };

  const commitIndexFromScroll = (el: HTMLDivElement) => {
    const nextIndex = Math.round(el.scrollLeft / el.clientWidth);
    const next = slides[nextIndex];
    if (!next) return;

    // Ensure we end up perfectly aligned
    el.scrollTo({ left: nextIndex * el.clientWidth, behavior: "smooth" });

    if (next.slug !== slug) {
      setSlug(next.slug);
      setURLForLaunchpad(next.slug);
    }
  };

  return (
    <div
      onMouseDown={onBackgroundClick}
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
        ref={containerRef}
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          overscrollBehavior: "contain",
          touchAction: "pan-x",
        }}
        onWheel={(e) => {
          const el = containerRef.current;
          if (!el) return;

          // Use deltaX when it’s a trackpad horizontal swipe; otherwise use deltaY for mouse wheels.
          const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

          // Prevent page from “fighting” vertical scroll
          e.preventDefault();
          el.scrollLeft += dx;
        }}
        onScroll={(e) => {
          const el = e.currentTarget;

          // Debounce: update active slug only when scrolling “settles”
          if (scrollEndTimer.current) window.clearTimeout(scrollEndTimer.current);
          scrollEndTimer.current = window.setTimeout(() => commitIndexFromScroll(el), 120);
        }}
      >
        {slides.map((s) => (
          <div
            key={s.slug}
            style={{
              flex: "0 0 100%",
              height: "100%",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
              display: "grid",
              placeItems: "center",
              padding: "70px 18px 110px",
            }}
          >
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
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 18, fontWeight: 650 }}>{s.title}</div>
                <div style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 12 }}>{s.slug}</div>
              </div>
              {s.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSlide() {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 16, lineHeight: 1.5 }}>
        Daniel Lee — building interactive, high-polish web experiences.
      </div>
      <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        Use the Dock, Cmd+K Spotlight, or the Terminal (coming soon) to jump anywhere instantly.
      </div>
    </div>
  );
}

function SkillsSlide() {
  return (
    <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
      Skills page placeholder — next phase we’ll add progress bars + hover tooltips.
    </div>
  );
}

function EducationSlide() {
  return (
    <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
      Education placeholder — next phase we’ll lay out a single-screen education card.
    </div>
  );
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
      <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>
        macOS-style portfolio experience with Launchpad, Spotlight, and Terminal navigation.
      </div>
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

      <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.5 }}>
        Not using Gmail? Copy my email and send a message from any client.
      </div>
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
