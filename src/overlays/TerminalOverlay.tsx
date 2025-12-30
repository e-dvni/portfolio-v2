// src/overlays/TerminalOverlay.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { runCommand } from "../system/commands";
import { PROFILE } from "../config/profile";
import DraggableWindow from "../components/DraggableWindow";
import { useUI } from "../state/uiStore";

type Line = { kind: "system" | "user" | "out"; text: string };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function helpText(): string[] {
  return [
    "Commands:",
    "  open about | skills | education | projects | contact",
    "  open launchpad",
    "  github | linkedin | email",
    "  toggle theme",
    "  clear",
    "  exit",
    "  help",
  ];
}

function openGmailCompose() {
  const to = encodeURIComponent(PROFILE.email);
  const subject = encodeURIComponent("Portfolio Inquiry");
  const body = encodeURIComponent("Hey Daniel — I checked out your portfolio and...");
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
  runCommand({ type: "OPEN_EXTERNAL", url: gmail });
}

export default function TerminalOverlay() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const focusWindow = useUI((s) => s.focusWindow);

  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number>(-1); // -1 = new line
  const [draft, setDraft] = useState<string>("");

  const [lines, setLines] = useState<Line[]>(() => [
    { kind: "system", text: "edvni@portfolio ~ % Hello, my name is Daniel Lee — ask me anything :) (commands: help)" },
  ]);

  const prompt = useMemo(() => "edvni@portfolio ~ % ", []);

  useEffect(() => {
    // Bring to front and focus input when opened
    focusWindow("terminal");
    inputRef.current?.focus();
  }, [focusWindow]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const close = () => runCommand({ type: "CLOSE_TERMINAL" });

  const print = (text: string) => setLines((ls) => [...ls, { kind: "out", text }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;

    setLines((ls) => [...ls, { kind: "user", text: prompt + cmd }]);

    const q = normalize(cmd);

    if (q === "exit" || q === "quit" || q === "close") {
      print("Closing Terminal…");
      close();
      return;
    }

    if (q === "clear") {
      setLines([{ kind: "system", text: "edvni@portfolio ~ % (cleared)" }]);
      return;
    }

    if (q === "help" || q === "?" || q === "commands") {
      for (const t of helpText()) print(t);
      return;
    }

    if (q === "toggle theme" || q === "theme toggle") {
      runCommand({ type: "TOGGLE_THEME" });
      print("Toggled theme.");
      return;
    }

    if (q === "github" || q === "open github") {
      runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.githubUrl });
      print("Opening GitHub…");
      return;
    }

    if (q === "linkedin" || q === "open linkedin") {
      runCommand({ type: "OPEN_EXTERNAL", url: PROFILE.linkedinUrl });
      print("Opening LinkedIn…");
      return;
    }

    if (q === "email" || q === "mail" || q === "gmail" || q === "open email") {
      openGmailCompose();
      print("Opening Gmail compose…");
      return;
    }

    if (q === "launchpad" || q === "open launchpad") {
      runCommand({ type: "OPEN_LAUNCHPAD", slug: "about" });
      print("Opening Launchpad…");
      return;
    }

    if (q.startsWith("open ")) {
      const arg = q.replace(/^open\s+/, "").trim();
      const map: Record<string, string> = {
        about: "about",
        skills: "skills",
        education: "education",
        projects: "projects",
        contact: "contact",
      };

      if (map[arg]) {
        runCommand({ type: "OPEN_LAUNCHPAD", slug: map[arg] });
        print(`Opening Launchpad: ${arg}…`);
        return;
      }
    }

    print(`Command not found: ${cmd}`);
    print(`Type "help" to see available commands.`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = value;
      setValue("");
      setCursor(-1);
      setDraft("");
      setHistory((h) => [cmd, ...h].slice(0, 50));
      run(cmd);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => {
        if (history.length === 0) return c;
        if (c === -1) setDraft(value);
        const next = Math.min(c + 1, history.length - 1);
        setValue(history[next] ?? "");
        return next;
      });
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => {
        if (history.length === 0) return c;
        const next = Math.max(c - 1, -1);
        if (next === -1) setValue(draft);
        else setValue(history[next] ?? "");
        return next;
      });
      return;
    }
  };

  return (
    <DraggableWindow
      windowKey="terminal"
      defaultSize={{ width: 980, height: 640 }}
      titleBar={({ onPointerDown }) => (
        <div
          onPointerDown={onPointerDown}
          onMouseDown={() => inputRef.current?.focus()}
          style={{
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid var(--border)",
            background: "var(--panelSolid)",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={close}
              title="Close"
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                border: "none",
                background: "rgba(255,95,86,0.92)",
                cursor: "pointer",
                padding: 0,
              }}
            />
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,189,46,0.9)" }} />
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(39,201,63,0.9)" }} />
          </div>

          <div style={{ marginLeft: 6, color: "var(--fg)", fontSize: 13, fontWeight: 650 }}>Terminal</div>

          <div style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 12 }}>
            Drag title bar • Esc to close • type “help”
          </div>
        </div>
      )}
    >
      <div
        style={{
          height: "calc(640px - 44px)",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          border: "1px solid var(--border)",
          borderTop: "none",
          background: "var(--panelSolid)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "1fr auto",
        }}
        onMouseDown={() => inputRef.current?.focus()}
      >
        <div
          ref={scrollRef}
          style={{
            padding: 14,
            overflow: "auto",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--fg)",
          }}
        >
          {lines.map((l, i) => (
            <div
              key={i}
              style={{
                color:
                  l.kind === "system"
                    ? "rgba(154,208,255,0.95)"
                    : l.kind === "user"
                    ? "var(--fg)"
                    : "rgba(233,237,245,0.85)",
                whiteSpace: "pre-wrap",
              }}
            >
              {l.text}
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--panel)",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            fontSize: 13,
            color: "var(--fg)",
          }}
        >
          <div style={{ color: "var(--muted)" }}>{prompt}</div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (cursor === -1) setDraft(e.target.value);
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            style={{
              flex: 1,
              background: "var(--panel)",
              border: "none",
              outline: "none",
              color: "var(--fg)",
              fontFamily: "inherit",
              fontSize: "inherit",
              padding: "6px 8px",
              borderRadius: 10,
            }}
          />
        </div>
      </div>
    </DraggableWindow>
  );
}
