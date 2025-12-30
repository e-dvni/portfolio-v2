import { useEffect, useMemo, useRef, useState } from "react";
import { runCommand } from "../system/commands";
import { PROFILE } from "../config/profile";

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  action: () => void;
};

function normalize(s: string) {
  return s.trim().toLowerCase();
}

/**
 * Tiny fuzzy scorer:
 * - reward prefix matches, word matches, and ordered character matches
 * - enough to feel "Spotlight-like" without a library
 */
function score(queryRaw: string, textRaw: string) {
  const q = normalize(queryRaw);
  const t = normalize(textRaw);
  if (!q) return 1;

  if (t === q) return 200;
  if (t.startsWith(q)) return 140;
  if (t.includes(q)) return 90;

  // word boundary bonus
  const words = t.split(/[\s:/_-]+/g);
  for (const w of words) {
    if (w.startsWith(q)) return 120;
    if (w.includes(q)) return 70;
  }

  // ordered character match (very lightweight fuzzy)
  let ti = 0;
  let matched = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    let found = false;
    while (ti < t.length) {
      if (t[ti] === ch) {
        found = true;
        ti++;
        break;
      }
      ti++;
    }
    if (found) matched++;
    else break;
  }
  if (matched === 0) return 0;

  // scale by completeness
  return Math.round((matched / q.length) * 55);
}

function isInteractiveTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return Boolean(el.closest("button, a, input, textarea, select, [role='button'], [role='link']"));
}

function openGmailCompose() {
  const to = encodeURIComponent(PROFILE.email);
  const subject = encodeURIComponent("Portfolio Inquiry");
  const body = encodeURIComponent("Hey Daniel — I checked out your portfolio and...");
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
  runCommand({ type: "OPEN_EXTERNAL", url: gmail });
}

function parseAndExecute(queryRaw: string): boolean {
  const q = normalize(queryRaw);
  if (!q) return false;

  if (q === "toggle theme" || q === "theme toggle") {
    runCommand({ type: "TOGGLE_THEME" });
    return true;
  }

  if (q === "terminal" || q === "open terminal") {
    runCommand({ type: "OPEN_TERMINAL" });
    return true;
  }

  if (q.startsWith("open ")) {
    const arg = q.replace(/^open\s+/, "").trim();
    if (!arg) return false;

    const map: Record<string, string> = {
      launchpad: "about",
      about: "about",
      skills: "skills",
      education: "education",
      projects: "projects",
      contact: "contact",
    };

    if (arg === "terminal") {
      runCommand({ type: "OPEN_TERMINAL" });
      return true;
    }

    if (map[arg]) {
      runCommand({ type: "OPEN_LAUNCHPAD", slug: map[arg] });
      return true;
    }

    if (arg === "github") {
      runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.githubUrl });
      return true;
    }
    if (arg === "linkedin") {
      runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.linkedinUrl });
      return true;
    }
    if (arg === "mail" || arg === "email" || arg === "gmail") {
      openGmailCompose();
      return true;
    }
  }

  if (q === "github") {
    runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.githubUrl });
    return true;
  }
  if (q === "linkedin") {
    runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.linkedinUrl });
    return true;
  }
  if (q === "mail" || q === "email" || q === "gmail") {
    openGmailCompose();
    return true;
  }

  if (q === "launchpad") {
    runCommand({ type: "OPEN_LAUNCHPAD", slug: "about" });
    return true;
  }
  if (q === "projects") {
    runCommand({ type: "OPEN_LAUNCHPAD", slug: "projects" });
    return true;
  }
  if (q === "skills") {
    runCommand({ type: "OPEN_LAUNCHPAD", slug: "skills" });
    return true;
  }
  if (q === "education") {
    runCommand({ type: "OPEN_LAUNCHPAD", slug: "education" });
    return true;
  }
  if (q === "contact") {
    runCommand({ type: "OPEN_LAUNCHPAD", slug: "contact" });
    return true;
  }

  return false;
}

export default function SpotlightOverlay() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const items: Item[] = useMemo(() => {
    const launchpadItems: Item[] = [
      {
        id: "lp-about",
        title: "Open Launchpad",
        subtitle: "About",
        keywords: ["open", "launchpad", "about", "bio"],
        action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "about" }),
      },
      {
        id: "sys-terminal",
        title: "Open Terminal",
        subtitle: "Ask / navigate (commands)",
        keywords: ["terminal", "command", "open terminal", "ask", "navigate"],
        action: () => runCommand({ type: "OPEN_TERMINAL" }),
      },
      {
        id: "lp-skills",
        title: "Open Launchpad",
        subtitle: "Skills",
        keywords: ["open", "launchpad", "skills", "frontend", "react", "typescript"],
        action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "skills" }),
      },
      {
        id: "lp-edu",
        title: "Open Launchpad",
        subtitle: "Education",
        keywords: ["open", "launchpad", "education", "school"],
        action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "education" }),
      },
      {
        id: "lp-projects",
        title: "Open Launchpad",
        subtitle: "Projects",
        keywords: ["open", "launchpad", "projects", "portfolio", "led", "builder"],
        action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "projects" }),
      },
      {
        id: "lp-contact",
        title: "Open Launchpad",
        subtitle: "Contact",
        keywords: ["open", "launchpad", "contact", "email", "github", "linkedin"],
        action: () => runCommand({ type: "OPEN_LAUNCHPAD", slug: "contact" }),
      },
    ];

    const externalItems: Item[] = [
      {
        id: "ext-email",
        title: "Email Daniel",
        subtitle: PROFILE.email,
        keywords: ["email", "mail", "gmail", "contact"],
        action: openGmailCompose,
      },
      {
        id: "ext-github",
        title: "Open GitHub",
        subtitle: PROFILE.githubUrl,
        keywords: ["github", "repo", "code", "e-dvni"],
        action: () => runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.githubUrl }),
      },
      {
        id: "ext-linkedin",
        title: "Open LinkedIn",
        subtitle: PROFILE.linkedinUrl,
        keywords: ["linkedin", "profile", "resume", "connect"],
        action: () => runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.linkedinUrl }),
      },
      {
        id: "ext-led",
        title: "Open Live Demo",
        subtitle: "Custom LED Builder",
        keywords: ["led", "builder", "shopify", "custom", "live", "demo"],
        action: () => runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.ledBuilderUrl }),
      },
      {
        id: "ext-portfolio-repo",
        title: "Open Repo",
        subtitle: "This Portfolio",
        keywords: ["portfolio", "repo", "github", "source"],
        action: () => runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.portfolioRepoUrl }),
      },
    ];

    const systemItems: Item[] = [
      {
        id: "sys-toggle-theme",
        title: "Toggle Theme",
        subtitle: "Light / Dark",
        keywords: ["theme", "toggle", "dark", "light", "mode"],
        action: () => runCommand({ type: "TOGGLE_THEME" }),
      },
      {
        id: "sys-help",
        title: "Help",
        subtitle: "Try: open projects • github • email • toggle theme",
        keywords: ["help", "commands", "how", "?"],
        action: () => {
          // Just sets a suggestion query; does not close spotlight
          setQ("open projects");
          inputRef.current?.focus();
        },
      },
    ];

    return [...launchpadItems, ...externalItems, ...systemItems];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const results = useMemo(() => {
    const nq = normalize(q);
    const ranked = items
      .map((it) => {
        const hay = [it.title, it.subtitle ?? "", ...it.keywords].join(" ");
        return { it, s: score(nq, hay) };
      })
      .filter((x) => (nq ? x.s > 0 : true))
      .sort((a, b) => b.s - a.s)
      .map((x) => x.it);

    return ranked.slice(0, 8);
  }, [items, q]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      runCommand({ type: "CLOSE_SPOTLIGHT" });
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, results.length - 1)));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      // If command parser can execute directly, do it.
      if (parseAndExecute(q)) return;

      // Otherwise run highlighted result.
      const picked = results[active];
      if (picked) picked.action();
      return;
    }
  };

  return (
    <div
      onMouseDown={(e) => {
        // click empty space closes
        if (!isInteractiveTarget(e.target)) runCommand({ type: "CLOSE_SPOTLIGHT" });
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
            onKeyDown={onKeyDown}
            placeholder="Search… (Cmd+K)  •  Try: open projects, github, email"
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
          {results.map((r, i) => {
            const isActive = i === active;
            return (
              <button
                key={r.id}
                onClick={r.action}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: isActive ? "rgba(255,255,255,0.10)" : "transparent",
                  color: "var(--fg)",
                  padding: "12px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  display: "grid",
                  gap: 4,
                }}
                onMouseEnter={() => setActive(i)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontWeight: 650 }}>{r.title}</div>
                  {r.subtitle ? (
                    <div style={{ color: "var(--muted)", fontSize: 12, marginLeft: "auto" }}>{r.subtitle}</div>
                  ) : null}
                </div>
              </button>
            );
          })}

          {results.length === 0 && (
            <div style={{ padding: 14, color: "var(--muted)", display: "grid", gap: 6 }}>
              <div>No matches.</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Try: <span style={{ color: "var(--fg)" }}>open projects</span>,{" "}
                <span style={{ color: "var(--fg)" }}>github</span>,{" "}
                <span style={{ color: "var(--fg)" }}>email</span>,{" "}
                <span style={{ color: "var(--fg)" }}>toggle theme</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
